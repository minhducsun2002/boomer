import { MessageEmbed } from 'discord.js';
import { chunk, pad } from '@pepper/utils';
import { mode_friendly, modes } from '@pepper/constants/osu';
import type { Beatmapset } from './beatmapset';
import type { Beatmap } from './beatmap';
import { osuUserExtra } from './user';
import { fetchRecentApi, fetchMapset, fetchBeatmapFile } from './fetch';
import type { PromiseValue } from 'type-fest';
import { accuracy } from './utils';
import { modbits, parser as beatmapParser, diff, ppv2 } from 'ojsama';

export function embedBeatmap(b: Beatmap, s: Beatmapset) {
    let {
        version, difficulty_rating,
        max_combo, ar, accuracy, cs, drain, total_length,
        mode_int, bpm, id: map_id
    } = b, {
        title, artist, id: set_id, status, creator, user_id,
        ranked, ranked_date, last_updated, covers
    } = s
    return new MessageEmbed()
        .setTitle(`${artist} - ${title} [${version}]`)
        .setURL(`https://osu.ppy.sh/beatmapsets/${set_id}#${modes[mode_int]}/${map_id}`)
        .setDescription(
            `Mapped by **[${creator}](https://osu.ppy.sh/users/${user_id})**. `
            + (!(ranked > 0) ? `**${status.charAt(0).toUpperCase() + status.substr(1)}**.\n` : `\n`)
            + ((ranked > 0)
                ? `Ranked **${new Date(ranked_date).toUTCString()}**.`
                : `Last updated **${new Date(last_updated)}**`)
        )
        .setImage(covers["cover@2x"])
        .addField(
            `Difficulty`,
            `${difficulty_rating} :star: - \`AR\`**${ar}** \`CS\`**${cs}** \`OD\`**${accuracy}** \`HP\`**${drain}**`
            + ` - ${bpm} BPM`
        )
        .addField(
            `Length`,
            `**${max_combo}**x | ${pad(2)(Math.floor(total_length / 60))}:${pad(2)(total_length % 60)}`,
            true
        )
        .addField(`Game mode`, mode_friendly[mode_int], true)
}

export function embedBeatmapset(
    s : Beatmapset,
    MAX_DIFF_PER_PAGE: number,
    mapFilter = (b : Beatmap[]) : Beatmap[] => b,
) {
    let {
        beatmaps, converts,
        title, artist, id: set_id, status, creator, user_id,
        ranked, ranked_date, last_updated, covers
    } = s;
    beatmaps = beatmaps.concat(...converts);
    beatmaps = mapFilter(beatmaps);

    let availableModes = [] as string[];
    beatmaps.forEach(a => (availableModes.includes(a.mode) ? 0 : availableModes.push(a.mode)));

    // start building embed for modes
    return availableModes.map((m, ii, ___) => {
        let maps = beatmaps.filter(a => a.mode === m).sort((m1, m2) => m1.difficulty_rating - m2.difficulty_rating);

        return chunk(maps, MAX_DIFF_PER_PAGE).map((chunked, i, _) => (
            new MessageEmbed()
            .setTitle(`${artist} - ${title}`)
            .setURL(`https://osu.ppy.sh/beatmapsets/${set_id}`)
            .setDescription(
                `Mapped by **[${creator}](https://osu.ppy.sh/users/${user_id})**. `
                + (!(ranked > 0) ? `**${status.charAt(0).toUpperCase() + status.substr(1)}**.\n` : `\n`)
                + ((ranked > 0)
                    ? `Ranked **${new Date(ranked_date).toLocaleString('en-US')}**.`
                    : `Last updated **${new Date(last_updated).toLocaleString('en-US')}**.`)
                + `\nDownload : [main site](https://osu.ppy.sh/beatmapsets/${set_id}/download) | `
                + `[Ripple mirror](https://storage.ripple.moe/d/${set_id})`
            )
            .setImage(covers["cover@2x"])
            .addFields(chunked.map(
                ({
                    version, difficulty_rating,
                    max_combo, ar, accuracy, cs, drain,
                    total_length, id
                }) => ({
                    name: version,
                    value:
                        `${difficulty_rating} :star:${max_combo ? ` | **${max_combo}**x` : ''} | `
                        + `${pad(2)(Math.floor(total_length / 60))}:${pad(2)(total_length % 60)} | `
                        + `\`AR\`**${ar}** \`CS\`**${cs}** \`OD\`**${accuracy}** \`HP\`**${drain}**\n`
                        + `[Link](https://osu.ppy.sh/beatmaps/${id})`
                })
            ))
            .setFooter(
                `Mode : ${mode_friendly[modes.findIndex(_ => _ === m)]} | `
                + `Page ${i + 1}/${_.length} - ${ii + 1}/${___.length}`
            )
            .setTimestamp()
        ));
    }).flat();
}

export async function embedSingleScoreApi(
    mode_int: keyof typeof accuracy,
    score : PromiseValue<ReturnType<typeof fetchRecentApi>>[0]
) {
    let {
        beatmap_id, enabled_mods, rank, perfect, date, maxcombo,
        count50, count100, count300, countkatu, countgeki, countmiss
    } = score;

    let mapset = await fetchMapset(+beatmap_id);
    let map = [...mapset.beatmaps, ...mapset.converts].find(map => map.id === +beatmap_id);
    let mods = modbits.string(+enabled_mods);

    let { count_circles, count_sliders, count_spinners } = map;
    let completion = (+countmiss + +count50 + +count100 + +count300) / (count_circles + count_sliders + count_spinners);
    let _accuracy = accuracy[mode_int]({
        countMiss: +countmiss,
        count50: +count50,
        count100: +count100,
        count100k: +countkatu,
        count300: +count300,
        count300k: +countgeki
    }) * 100;

    let map_file = await fetchBeatmapFile(+beatmap_id);
    let parser = new beatmapParser();
    parser.feed(map_file);
    let pp = ppv2({
        stars: new diff().calc({ map: parser.map, mods: +enabled_mods }),
        acc_percent: _accuracy, nmiss: +countmiss, n50: +count50, n100: +count100, n300: +count300
    }).total

    let full_combo_pp = ppv2({
        stars: new diff().calc({ map: parser.map, mods: +enabled_mods }),
        acc_percent: _accuracy, nmiss: 0
    }).total

    return new MessageEmbed()
        .setURL(`https://osu.ppy.sh/users/${score.user_id}`)
        .addField(
            `${mapset.artist} - ${mapset.title} [${map.version}]` + (mods.length ? `+${mods}` : ''),
            `[**${rank}**] **${pp.toFixed(4)}**pp (?) **${_accuracy.toFixed(3)}**% - **${maxcombo}**x${+perfect ? '' : `/**${map.max_combo}**x`} `
            + (+perfect ? '(FC)' : (completion != 1 ? `(completed ${(completion * 100).toFixed(2)}%)` : ''))
            + (+perfect ? '' : ` (**${full_combo_pp.toFixed(2)}**pp (?) if FC)`)
            + `\n[**${count300}**/**${count100}**/**${count50}**/**${countmiss}**] `
            + `@ **${new Date(date).toLocaleString('vi-VN', { timeZone: 'UTC' })}**`
            + `\n${map.difficulty_rating} :star: `
            + `- \`AR\`**${map.ar}** \`CS\`**${map.cs}** \`OD\`**${map.accuracy}** \`HP\`**${map.drain}** `
            + `- **${map.bpm}** BPM`
            + `\n[[**Beatmap**]](https://osu.ppy.sh/beatmaps/${map.id})`
        );
}

export async function embedSingleScore(
    mode_path : string,
    score : osuUserExtra['scoresBest'][0],
    username : string
) {
    let {
        user_id,
        accuracy, mods, perfect, rank, max_combo,
        beatmap: b, beatmapset: s, pp, created_at, id,
        statistics: { count_miss, count_50, count_100, count_300 }
    } = score;

    let calculated = false, full_combo_pp = 0;
    accuracy *= 100;
    let parser = new beatmapParser(); parser.feed(await fetchBeatmapFile(b.id));
    if (!pp) {
        pp = ppv2({
            stars: new diff().calc({ map: parser.map, mods: modbits.from_string(mods.join('')) }),
            acc_percent: accuracy, nmiss: count_miss, n50: count_50, n100: count_100, n300: count_300
        }).total;
        calculated = true;
    }
    full_combo_pp = ppv2({
        stars: new diff().calc({ map: parser.map, mods: modbits.from_string(mods.join('')) }),
        acc_percent: accuracy, nmiss: 0
    }).total;

    return new MessageEmbed()
        .setTitle(`Most recent play of **${username}**`)
        .setURL(`https://osu.ppy.sh/users/${user_id}`)
        .addField(
            `${s.artist} - ${s.title} [${b.version}]`
            + (mods.length ? `+${mods.join('')}` : ''),
            `[**${rank}**] **${pp.toFixed(4)}**pp${calculated ? ' (?)' : ''} `
            + `(**${accuracy.toFixed(3)}**% | **${max_combo}**x/**${parser.map.max_combo()}**x) `
            + (perfect ? `(FC)` : `(**${full_combo_pp.toFixed(2)}**pp (?) if FC)`)
            + `\n${b.difficulty_rating} :star: `
            + `- \`AR\`**${b.ar}** \`CS\`**${b.cs}** \`OD\`**${b.accuracy}** \`HP\`**${b.drain}** `
            + `- **${b.bpm}** BPM`
            + `\n[**${count_300}**/**${count_100}**/**${count_50}**/**${count_miss}**]`
            + ` @ **${
                new Date(created_at)
                    .toLocaleString('vi-VN', { timeZone: 'UTC' })
            }**`
            + `\n[[**Beatmap**]](https://osu.ppy.sh/beatmapsets/${s.id}#${b.mode}/${b.id}) `
            + ` [[**Score**]](https://osu.ppy.sh/scores/${mode_path}/${id})`
        );
}

export function embedScoreset(
    recents: osuUserExtra['scoresBest'],
    u : string, id: number, mode: string, MAX_VIEW = 5
) {
    return chunk(recents, MAX_VIEW)
        .map((s, i, c) => {
            let out = new MessageEmbed()
                .setAuthor(u, `https://a.ppy.sh/${id}`, `https://osu.ppy.sh/users/${id}`)
                .setFooter(`Page ${i + 1}/${c.length} | All times are UTC`)
            s.forEach(({
                accuracy, mods, perfect, rank, max_combo,
                beatmap: b, beatmapset: s, pp, created_at, id,
                statistics: { count_miss, count_50, count_100, count_300 }
            }) => out.addField(
                `${s.artist} - ${s.title} [${b.version}]`
                + (mods.length ? `+${mods.join('')}` : ''),
                `[**${rank}**] ${
                    // multiple formatting
                    pp
                    ? `**${pp}**pp (**${(accuracy * 100).toFixed(3)}**% | **${max_combo}**x)`
                    : `**${(accuracy * 100).toFixed(3)}**% - **${max_combo}**x`
                }`
                + (perfect ? ` (FC)` : '')
                + `\n${b.difficulty_rating} :star: `
                + `- \`AR\`**${b.ar}** \`CS\`**${b.cs}** \`OD\`**${b.accuracy}** \`HP\`**${b.drain}** `
                + `- **${b.bpm}** BPM`
                + `\n[**${count_300}**/**${count_100}**/**${count_50}**/**${count_miss}**]`
                + ` @ **${
                    new Date(created_at)
                        .toLocaleString('vi-VN', { timeZone: 'UTC' })
                }**`
                + `\n[[**Beatmap**]](https://osu.ppy.sh/b/${b.id}) `
                + ` [[**Score**]](https://osu.ppy.sh/scores/${mode}/${id})`
            ))
            return out;
        })
}

export async function embedScoresetApi(
    mode_int: keyof typeof accuracy,
    scoreset: PromiseValue<ReturnType<typeof fetchRecentApi>>,
    MAX_DIFF_PER_PAGE = 5
) {
    let maps = new Map<number, PromiseValue<ReturnType<typeof fetchMapset>>>();
    let __ = [...new Set(scoreset.map(a => +a.beatmap_id))]
        .map(async id => {
            if (maps.has(id)) return;
            let m = await fetchMapset(id);
            m.beatmaps.forEach(b => maps.set(b.id, m));
            m.converts.forEach(b => maps.set(b.id, m));
        })
    await Promise.all(__);
    let _ = chunk(scoreset, MAX_DIFF_PER_PAGE).map(
        async (a) => new MessageEmbed()
            .addFields(
                await Promise.all(a.map(async ({
                    beatmap_id: id, enabled_mods, rank, perfect, date, maxcombo,
                    count50, count100, count300, countkatu, countgeki, countmiss
                }) => {
                    let s = maps.get(+id)
                    let b = s.beatmaps.concat(s.converts).find(a => a.id === +id);
                    let mods = modbits.string(+enabled_mods);
                    return {
                        name: `${s.artist} - ${s.title} [${b.version}]`
                        + (mods.length ? `+${mods}` : ''),
                        value: `[**${rank}**] **${
                            (accuracy[mode_int]({
                                countMiss: +countmiss,
                                count50: +count50,
                                count100: +count100,
                                count100k: +countkatu,
                                count300: +count300,
                                count300k: +countgeki
                            }) * 100).toFixed(3)
                        }**% `
                        + `(${count300}/${count100}/${count50}/${countmiss}) `
                        + `- **${maxcombo}**x`
                        + (+perfect ? ' (FC)' : '')
                        + `\n@ **${
                            new Date(date)
                                .toLocaleString('vi-VN', { timeZone: 'UTC' })
                        }**`
                        + `\n${b.difficulty_rating} :star: `
                        + `- \`AR\`**${b.ar}** \`CS\`**${b.cs}** \`OD\`**${b.accuracy}** \`HP\`**${b.drain}** `
                        + `- **${b.bpm}** BPM`
                        + `\n[[**Beatmap**]](https://osu.ppy.sh/beatmaps/${id})`
                    }
                }))
            )
    );
    return await Promise.all(_);
}