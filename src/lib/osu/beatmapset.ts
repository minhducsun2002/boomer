import { MessageEmbed } from 'discord.js';
import type { Beatmap } from './beatmap';
import { chunk, pad } from '@pepper/utils';
import { mode_friendly, modes } from '@pepper/constants/osu'
export interface Beatmapset {
    id: number;
    title: string; artist: string;
    play_count: number; favourite_count: number;
    submitted_date: string; last_updated: string; ranked_date: string;
    source: string; tags: string; preview_url: string;
    video: boolean; storyboard: boolean;
    ranked: number; status: string;

    beatmaps: Beatmap[]; converts: Beatmap[];

    creator: string; user_id: number;
    covers: {
        cover: string; 'cover@2x': string;
        card: string; 'card@2x': string;
        list: string; 'list@2x': string;
        slimcover: string; 'slimcover@2x': string;
    };
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