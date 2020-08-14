import { MessageEmbed } from 'discord.js';
import { chunk, pad } from '@pepper/utils';
import { mode_friendly, modes } from '@pepper/constants/osu';
import type { Beatmapset } from './beatmapset';
import type { Beatmap } from './beatmap';
import { osuUserExtra } from './user';
import { fetchRecentApi, fetchMapset } from './fetch';
import type { PromiseValue } from 'type-fest';
import { accuracy } from './utils';
import { modbits } from 'ojsama';

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

export function embedScoreset(
    recents: osuUserExtra['scoresBest'],
    u : string, id: number, mode: string, MAX_VIEW = 5
) {
    return chunk(recents, MAX_VIEW)
        .map((s, i, c) => {
            let out = new MessageEmbed()
                .setTitle(`Recent plays of **${u}**`)
                .setURL(`https://osu.ppy.sh/users/${id}`)
                .setFooter(`Page ${i + 1}/${c.length} | All times are UTC`)
            s.forEach(({
                accuracy, mods, perfect, rank, max_combo,
                beatmap: b, beatmapset: s, pp, created_at, id
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
                + `\n@ **${
                    new Date(created_at)
                        .toLocaleString('vi-VN', { timeZone: 'UTC' })
                }**`
                + `\n${b.difficulty_rating} :star: - \`AR\`**${b.ar}** \`CS\`**${b.cs}** \`OD\`**${b.accuracy}** \`HP\`**${b.drain}**`
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
        async (a, i, c) => new MessageEmbed()
            .setFooter(`Page ${i + 1}/${c.length} | All times are UTC`)
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
                        + `\n[**Beatmap**](https://osu.ppy.sh/beatmaps/${id})`
                    }
                }))
            )
    );
    return await Promise.all(_);
}