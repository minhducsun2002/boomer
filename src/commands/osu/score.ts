import { OsuCommand } from './baseCommand';
import { Message, MessageEmbed } from 'discord.js';
import axios from 'axios';
import { SUCCESS_COLOR, ERROR_COLOR } from '../../constants/colors';
import { accuracy as acc, modToString as mm } from '../../lib/osu/utils';
import { pad, chunk, paginatedEmbed } from '@pepper/utils';
import { modes } from '@pepper/constants/osu';
import { fetchMapset, fetchScore, checkURL as check, checkScoreURL as checkScore } from '@pepper/lib/osu';

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
                description: 'Beatmap ID/URL, or score URL'
            }, {
                id: 'username',
                match: 'rest',
                description: 'Username to check. Will be ignored if a score URL is passed'
            }, {
                id: 'mode',
                match: 'option',
                description: 'Gamemode to show. Can be `osu`, `taiko`, `fruits`, `mania`.',
                flag: ['/']
            }]
        })
    }

    private mode = {
        single: Symbol(), listing: Symbol()
    }

    async exec(m : Message, { beatmap, username, mode: gameMode } = { beatmap: '', username: '', mode: '' }) {
        const MAX_SCORES = 3;
        const err = new MessageEmbed().setColor(ERROR_COLOR)
            .setDescription(`Sorry, an error occurred.`);

        let gameModeInt = modes.indexOf(gameMode)
        if (!modes.includes(gameMode)) gameModeInt = 0;
        let _ = +beatmap, mode = this.mode.listing;
        if (isNaN(_)) {
            // try parsing as URL
            try { _ = check(beatmap).id; mode = this.mode.listing; } catch { _ = null }
            if (!_)
                try { _ = checkScore(beatmap).id; mode = this.mode.single } catch { _ = null }
        }

        if (!_)
            return m.channel.send(err.setDescription(`You didn't pass a beatmap URL/ID/score URL!`));

        let listingMode = async () => {
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

            let set = await fetchMapset(_, false);
            // determine gamemode if user relies on automatic behaviour
            if (!gameMode) {
                let map = set.beatmaps.find(a => a.id === _);
                gameModeInt = map.mode_int;
            }

            let r = await axios.get(`https://osu.ppy.sh/api/get_scores?k=${
                process.env.OSU_API_KEY
            }&b=${encodeURIComponent(_)}&u=${encodeURIComponent(username)}&m=${
                encodeURIComponent(gameModeInt)
            }`, {
                validateStatus: () => true
            });

            if (r.status === 404) return m.channel.send(`Sorry, could not find your beatmap.`);
            if (r.status !== 200) throw new Error(
                `Error getting scores : Expected status 200, got status ${r.status}.`
            );

            let scores = r.data as {
                score_id: string, score: string, username: string,
                maxcombo: string,
                count50: string, count100: string, count300: string, countmiss: string,
                countkatu: string, countgeki: string,
                perfect: string, enabled_mods: string, user_id: string,
                date: string, rank: string, pp: string
            }[];
            
            if (scores.length === 0)
                return m.channel.send(err.setDescription(`Sorry, no scores found on that beatmap.`))

            let results = set.beatmaps.find(a => a.id === _ && a.mode_int === gameModeInt);
            // converts can happen
            if (!results)
                results = set.converts.find(a => a.id === _ && a.mode_int === gameModeInt);
            let {
                difficulty_rating, mode_int, version, convert,
                max_combo, ar, accuracy, cs, drain, total_length, id
            } = results

            let __ = chunk(scores, MAX_SCORES);

            const createEmbed = (__ : typeof scores) => new MessageEmbed()
                .setColor(SUCCESS_COLOR).setTimestamp()
                .setURL(`https://osu.ppy.sh/beatmaps/${_}`)
                .setTitle(`Scores by \`${scores[0].username}\`\non **${set.artist}** - **${set.title}** [**${version}**]`)
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
                            count100: c3, count300: c6, count50: c1, countmiss: c0, countkatu: c3k, countgeki: c6k,
                            date
                        } = a;
                        let mods = mm(+enabled_mods);
                        return {
                            name : `${new Date(date).toUTCString()}`,
                            value : `[**${rank}**] **${pp}**pp (**${combo}**x${+perfect ? '' : (convert ? '' : `/**${max_combo}**x`)} | `
                            + `**${(acc[mode_int as keyof typeof acc]({
                                count50: +c1, count100: +c3,
                                count300: +c6, countMiss: +c0,
                                count100k: +c3k, count300k: +c6k
                            }) * 100).toFixed(3)}**%) ${+perfect ? '(FC)' : ''}\n`
                            + (mods.length ? `Mods : ${mods.join(', ')}\n` : '')
                            + `[Score link](https://osu.ppy.sh/scores/${modes[mode_int]}/${score_id})`
                        }
                    })
                )

            if (__.length < 2) return m.channel.send(createEmbed(__[0]));
            else
                paginatedEmbed()
                    .setChannel(m.channel)
                    .setEmbeds(
                        __.map(
                            (arr, i, _) => createEmbed(arr)
                                .setFooter(`Page ${i + 1}/${_.length}`)
                        )
                    )
                    .run({ idle: 20000, dispose: true })
        }

        let singleMode = async () => {
            let details = checkScore(beatmap);
            let score = await fetchScore(details.id, details.mode);
            let set = await fetchMapset(score.beatmapset.id, true);

            let {
                difficulty_rating, mode_int, version,
                max_combo, ar, accuracy, cs, drain, total_length, id
            } = score.beatmap
            let {
                perfect, max_combo : combo, mods, rank, pp, id: score_id,
                statistics: { count_miss, count_50, count_100, count_300 }
            } = score;

            const out = new MessageEmbed()
                .setColor(SUCCESS_COLOR).setTimestamp()
                .setURL(beatmap)
                .setTitle(`Score by \`${score.user.username}\`\non **${set.artist}** - **${set.title}** [**${version}**]`)
                .setDescription(
                    `\n${difficulty_rating} :star:${max_combo ? ` | **${max_combo}**x` : ''} | `
                    + `${pad(2)(Math.floor(total_length / 60))}:${pad(2)(total_length % 60)} | `
                    + `[Link](https://osu.ppy.sh/beatmaps/${id})`
                    + `\n\`AR\`**${ar}** \`CS\`**${cs}** \`OD\`**${accuracy}** \`HP\`**${drain}**\n`
                    + '\n'
                    + `(${count_300}/${count_100}/${count_50}/${count_miss})\n`
                    + `[**${rank}**] **${pp}**pp (**${combo}**x${+perfect ? '' : `/**${max_combo}**x`} | `
                    + `**${(accuracy * 100).toFixed(3)}**%) ${perfect ? '(FC)' : ''}\n`
                    + (mods.length ? `Mods : ${mods.join(', ')}\n` : '')
                    + `[Score link](https://osu.ppy.sh/scores/${modes[mode_int]}/${score_id})`
                );
            m.channel.send(out);
        }

        switch (mode) {
            case this.mode.listing: return await listingMode();
            case this.mode.single: return await singleMode();
        }
    }
}
