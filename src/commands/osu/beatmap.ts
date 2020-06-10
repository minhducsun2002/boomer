import { OsuCommand } from './baseCommand';
import { Message, MessageEmbed } from 'discord.js';
import axios from 'axios';
import cheerio from 'cheerio';
import { SUCCESS_COLOR, ERROR_COLOR } from '../../constants/colors';
import { PagedEmbeds } from '@minhducsun2002/paged-embeds';
import { chunk } from '../../lib/chunk';
import { log } from '../../lib/logger';
import { pad } from '../../lib/pad';
import { modes, mode_friendly } from '../../constants/osu';

const commandName = 'beatmap';
const aliases = [commandName, 'map'];

export interface Beatmap {
    id: number; beatmapset_id: number;
    mode: 'osu' | 'taiko' | 'fruits' | 'mania'; mode_int: number; convert: true | null;
    difficulty_rating: number; version: string;
    total_length: number; hit_length: number;
    bpm: number; cs: number, drain: number, accuracy: number, ar: number;
    playcount: number, passcount: number;
    max_combo: number;
}

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

const MAX_DIFF_PER_PAGE = 7;

export default class extends OsuCommand {
    constructor() {
        super(commandName, {
            aliases,
            description: 'Show beatmap(set) info.',
            args: [{
                id: 'beatmap',
                match: 'phrase',
                description: 'Beatmap(set) ID, or URL'
            },{
                id: 'set',
                match: 'flag',
                description: `Force parsing the ID (if an ID is passed) as a set ID, not a map ID`,
                flag: ['/']
            }],
            typing: true
        })
    }

    
    public checkURL (url : string) : { set?: number; id?: number; mode?: string } {
        let valid = !!url.match(/http(?:s)*:\/\/osu\.ppy\.sh\/(b|beatmapsets|beatmaps)\/(\d+)/);
        if (!valid) throw new TypeError(`Not a beatmap(set) URL`);
        let set = +(url.match(/http(?:s)*:\/\/osu\.ppy\.sh\/beatmapsets\/(\d+)/) || []).slice(1)[0];
        let id = +(
            url.match(/http(?:s)*:\/\/osu\.ppy\.sh\/beatmaps\/(\d+)/)
            || url.match(/http(?:s)*:\/\/osu\.ppy\.sh\/b\/(\d+)/)
            || (url.match(/http(?:s)*:\/\/osu\.ppy\.sh\/beatmapsets\/(\d+)#(osu|taiko|fruits|mania)\/(\d+)/) || []).slice(3)
        ).slice(1)[0];
        let [mode] = (url.match(/http(?:s)*:\/\/osu\.ppy\.sh\/beatmapsets\/(\d+)#(osu|taiko|fruits|mania)\/(\d+)/) || []).slice(2)
        return { set, id, mode };
    }

    async exec(m : Message, { beatmap, set } = { beatmap: '', set: false }) {
        const err = new MessageEmbed().setColor(ERROR_COLOR)
            .setDescription(`Sorry, an error occurred.`)
        // check if ID or URL
        let _id = +beatmap, mode = '';
        if (isNaN(_id)) {
            let _ = this.checkURL(beatmap);
            mode = _.mode;
            // base logic :
            // URL overrides everything.
            // if id is available, fetch map, else fetch mapset
            _id = (_.id ? _.id : _.set)
            // /set is enabled if no ID is present, and setId is present
            set = !!_.set && !_.id
            if (!_id) return m.channel.send(err.setDescription(`Sorry, couldn't find such beatmap(set).`))
        }
        try {
            const _ = await axios.get(
                set ? `https://osu.ppy.sh/beatmapsets/${_id}` : `https://osu.ppy.sh/beatmaps/${_id}`,
                { validateStatus: () => true }
            );
            if (_.status === 404) return m.channel.send(err);
            if (_.status !== 200) throw new Error(
                `Error getting beatmap : Expected status 200, got status ${_.status}`
            );

            const dom = cheerio.load(_.data);
            let __ : Beatmapset = JSON.parse(dom('#json-beatmapset').contents().first().text());

            let {
                beatmaps, converts,
                title, artist, id: set_id, status, creator, user_id,
                ranked, ranked_date, last_updated, covers
            } = __;
            beatmaps = beatmaps.concat(...converts);
            if (mode) beatmaps = beatmaps.filter(a => a.mode === mode);
            if (set) {
                let availableModes = [] as string[];
                beatmaps.forEach(a => (availableModes.includes(a.mode) ? 0 : availableModes.push(a.mode)));

                // start building embed for modes
                let out = availableModes.map((m, ii, ___) => {
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
                        .setColor(SUCCESS_COLOR)
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
                })

                new PagedEmbeds()
                    .addHandler('⬅️', (m, i, u, e) => ({ index: (i - 1 + e.length) % e.length }))
                    .addHandler('➡️', (m, i, u, e) => ({ index: (i + 1 + e.length) % e.length }))
                    .setChannel(m.channel)
                    .setEmbeds(out.flat())
                    .run({ idle: 20000, dispose: true })

            } else {
                let [{ version, difficulty_rating, max_combo, ar, accuracy, cs, drain, total_length, mode_int, bpm, id: map_id }] =
                    beatmaps.filter(a => a.id === _id);
                m.channel.send(
                    new MessageEmbed()
                        .setTitle(`${artist} - ${title} [${version}]`)
                        .setURL(`https://osu.ppy.sh/beatmapsets/${set_id}#${modes[mode_int]}/${map_id}`)
                        .setDescription(
                            `Mapped by **[${creator}](https://osu.ppy.sh/users/${user_id})**. `
                            + (!(ranked > 0) ? `**${status.charAt(0).toUpperCase() + status.substr(1)}**.\n` : `\n`)
                            + ((ranked > 0)
                                ? `Ranked **${new Date(ranked_date).toString()}**.`
                                : `Last updated **${new Date(last_updated)}**`)
                        )
                        .setImage(covers["cover@2x"])
                        .setColor(SUCCESS_COLOR)
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
                )
            }
        } catch (e) {
            log.error(`${e}`);
            m.channel.send(err.setDescription(`Sorry, an error occurred.`));
        }
    }
}
