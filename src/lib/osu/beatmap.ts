import { MessageEmbed } from 'discord.js';
import type { Beatmapset } from './beatmapset';
import { pad } from '@pepper/utils';
import { mode_friendly, modes } from '@pepper/constants/osu';

export interface Beatmap {
    id: number; beatmapset_id: number;
    mode: 'osu' | 'taiko' | 'fruits' | 'mania'; mode_int: number; convert: true | null;
    difficulty_rating: number; version: string;
    total_length: number; hit_length: number;
    bpm: number; cs: number, drain: number, accuracy: number, ar: number;
    playcount: number, passcount: number;
    max_combo: number;
}

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