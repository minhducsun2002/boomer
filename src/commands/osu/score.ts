import { OsuCommand } from './baseCommand';
import { Message, MessageEmbed } from 'discord.js';
import axios from 'axios';
import { SUCCESS_COLOR, ERROR_COLOR } from '../../constants/colors';
import { PagedEmbeds } from '@minhducsun2002/paged-embeds';
import { accuracy as acc, modToString as mm } from '../../lib/osu/utils';
import { pad, chunk } from '@pepper/utils';
import { modes } from '@pepper/constants/osu';
import { fetchMapset, checkURL as check } from '@pepper/lib/osu'

const commandName = 'score', aliases : string[] = [commandName, 'scores', 'sc'];

export = class extends OsuCommand {
    constructor() {
        super(commandName, {
            aliases,
            typing: true, 
            description: 'View score(s) on a map of a certain player.',
            args: [{
                id: 'beatmap',
                match: 'phrase',
                type: 'string',
                description: 'Beatmap ID or URL'
            }, {
                id: 'username',
                match: 'rest',
                description: 'Username to check'
            }]
        })
    }

    async exec(m : Message, { beatmap, username } = { beatmap: '', username: '' }) {
        const MAX_SCORES = 3;
        const err = new MessageEmbed().setColor(ERROR_COLOR)
            .setDescription(`Sorry, an error occurred.`);

        let _ = +beatmap;
        if (isNaN(_)) 
        // try parsing as URL
            try { _ = check(beatmap).id; } catch { _ = null }
            
        if (!_)
            return m.channel.send(err.setDescription('You passed neither a beatmap ID, nor a beatmap URL!'));
        if (!username)
            return m.channel.send(err.setDescription(`Who to check for scores?`))
        
        if (!process.env.OSU_API_KEY) {
            let { users, ownerID } = this.client;
            const owner = (await users.fetch(ownerID[0]));
            return m.channel.send(
                err.setDescription(
                    `Apologies, my owner has not configured me properly. Please contact `
                    + `\`${owner.username}\` and tell him I need a v1 API key for osu!.`
                )
            )
        }

        try {
            let r = await axios.get(`https://osu.ppy.sh/api/get_scores?k=${
                process.env.OSU_API_KEY
            }&b=${encodeURIComponent(_)}&u=${encodeURIComponent(username)}`, {
                validateStatus: () => true
            });

            if (r.status === 404) return m.channel.send(`Sorry, could not find your beatmap.`);
            if (r.status !== 200) throw new Error(
                `Error getting scores : Expected status 200, got status ${r.status}.`
            );

            let scores = r.data as {
                score_id: string, score: string, username: string,
                maxcombo: string, count50: string, count100: string, count300: string, countmiss: string,
                perfect: string, enabled_mods: string, user_id: string,
                date: string, rank: string, pp: string
            }[];
            
            if (scores.length === 0)
                return m.channel.send(err.setDescription(`Sorry, no scores found on that beatmap.`))

            let set = await fetchMapset(_, false)
            let {
                difficulty_rating, mode_int,
                max_combo, ar, accuracy, cs, drain, total_length, id
            } = set.beatmaps.find(a => a.id === _);

            let __ = chunk(scores, MAX_SCORES);

            const createEmbed = (__ : typeof scores) => new MessageEmbed()
                .setColor(SUCCESS_COLOR).setTimestamp()
                .setURL(`https://osu.ppy.sh/beatmaps/${_}`)
                .setTitle(`Scores by \`${scores[0].username}\`\non **${set.artist}** - **${set.title}**`)
                .setDescription(
                    `\n${difficulty_rating} :star:${max_combo ? ` | **${max_combo}**x` : ''} | `
                    + `${pad(2)(Math.floor(total_length / 60))}:${pad(2)(total_length % 60)} | `
                    + `[Link](https://osu.ppy.sh/beatmaps/${id})`
                    + `\n\`AR\`**${ar}** \`CS\`**${cs}** \`OD\`**${accuracy}** \`HP\`**${drain}**\n`
                )
                .addFields(
                    __.map(a => {
                        let {
                            rank, pp, enabled_mods, maxcombo: combo, perfect, score_id,
                            count100: c3, count300: c6, count50: c1, countmiss: c0, date
                        } = a;
                        let mods = mm(+enabled_mods);
                        return {
                            name : `${new Date(date).toUTCString()}`,
                            value : `[**${rank}**] **${pp}**pp (**${combo}**x${+perfect ? '' : `/**${max_combo}**x`} | `
                            + `**${(acc[mode_int as keyof typeof acc]({
                                count50: +c1, count100: +c3,
                                count300: +c6, countMiss: +c0,
                                count100k: 0, count300k: 0
                            }) * 100).toFixed(3)}**%) ${+perfect ? '(FC)' : ''}\n`
                            + (mods.length ? `Mods : ${mods.join(', ')}\n` : '')
                            + `[Score link](https://osu.ppy.sh/scores/${modes[mode_int]}/${score_id})`
                        }
                    })
                )

            if (__.length < 2) return m.channel.send(createEmbed(__[0]));
            else
                new PagedEmbeds()
                    .addHandler('⬅️', (m, i, u, e) => ({ index: (i - 1 + e.length) % e.length }))
                    .addHandler('➡️', (m, i, u, e) => ({ index: (i + 1 + e.length) % e.length }))
                    .setChannel(m.channel)
                    .setEmbeds(
                        __.map(
                            (arr, i, _) => createEmbed(arr)
                                .setFooter(`Page ${i + 1}/${_.length}`)
                        )
                    )
                    .run({ idle: 20000, dispose: true })
            
        } catch (e) {
            m.channel.send(err.setDescription(`Sorry, an error occurred.` + '```' + e + '```'));
        }
    }
}
