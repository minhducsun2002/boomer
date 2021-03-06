import { OsuCommand } from './baseCommand';
import { Message, MessageEmbed } from 'discord.js';
import axios from 'axios';
import { SUCCESS_COLOR, ERROR_COLOR } from '@pepper/constants/colors';
import { accuracy as acc} from '@pepper/lib/osu/utils';
import { pad, chunk, paginatedEmbed } from '@pepper/utils';
import { modes } from '@pepper/constants/osu';
import { fetchMapset, fetchScore, checkURL as check, checkScoreURL, embedSingleScore } from '@pepper/lib/osu';
import { modbits } from 'ojsama';

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
        const MAX_SCORES = 5;
        const err = new MessageEmbed().setColor(ERROR_COLOR)
            .setDescription(`Sorry, an error occurred.`);

        let gameModeInt = modes.indexOf(gameMode)
        if (!modes.includes(gameMode)) gameModeInt = 0;
        let _ = +beatmap, mode = this.mode.listing;
        if (isNaN(_)) {
            // try parsing as URL
            try { _ = check(beatmap).id; mode = this.mode.listing; } catch { _ = null }
            if (!_)
                try { _ = checkScoreURL(beatmap).id; mode = this.mode.single } catch { _ = null }
        }

        if (!_)
            return m.channel.send(err.setDescription(`You didn't pass a beatmap URL/ID/score URL!`));

        let listingMode = async () => {
            username = await this.resolveUserFromAuthor(username, m.author.id);
            if (!username) return m.channel.send(err.setDescription(`Who to check for scores?`))


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

            this.mapIdCache.setChannelMapId(m.channel.id, _);

            if (scores.length === 0)
                return m.channel.send(err.setDescription(`Sorry, no scores found on that beatmap.`))

            let results = set.beatmaps.find(a => a.id === _ && a.mode_int === gameModeInt);
            // converts can happen
            if (!results)
                results = set.converts.find(a => a.id === _ && a.mode_int === gameModeInt);
            let {
                difficulty_rating, mode_int, version, bpm,
                max_combo, ar, accuracy, cs, drain, total_length, id
            } = results

            let __ = chunk(scores, MAX_SCORES);

            const createEmbed = (__ : typeof scores) => new MessageEmbed()
                .setColor(SUCCESS_COLOR).setTimestamp()
                .setURL(`https://osu.ppy.sh/beatmaps/${id}`)
                .setTitle(`Scores by \`${scores[0].username}\`\non **${set.artist}** - **${set.title}** [**${version}**]`)
                .setDescription(
                    `\n${difficulty_rating} :star:${max_combo ? ` | **${max_combo}**x` : ''} | `
                    + `${pad(2)(Math.floor(total_length / 60))}:${pad(2)(total_length % 60)} | **${bpm}** BPM`
                    + `\n\`AR\`**${ar}** \`CS\`**${cs}** \`OD\`**${accuracy}** \`HP\`**${drain}**\n`
                    + '\n'
                    + __.map(a => {
                        let {
                            rank, pp, enabled_mods, maxcombo: combo, perfect, score_id,
                            count100: c3, count300: c6, count50: c1, countmiss: c0, countkatu: c3k, countgeki: c6k,
                            date
                        } = a;
                        let mods = modbits.string(+enabled_mods);
                        return (
                            `[**${rank}**] **${pp}**pp (**${combo}**x | `
                            + `**${(acc[mode_int as keyof typeof acc]({
                                count50: +c1, count100: +c3,
                                count300: +c6, countMiss: +c0,
                                count100k: +c3k, count300k: +c6k
                            }) * 100).toFixed(3)}**%) ${+perfect ? '(FC)' : ''}`
                            + (mods ? ` +**${mods}**` : '')
                            + `\n[**${c6}**/**${c3}**/**${c1}**/**${c0}**]`
                            + ` @ **${new Date(date).toLocaleString('vi-VN', { timeZone: 'UTC' })}**`
                            +`\n[**Score link**](https://osu.ppy.sh/scores/${modes[mode_int]}/${score_id})`
                        )
                    }).join('\n\n')
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
            let details = checkScoreURL(beatmap);
            let score = await fetchScore(details.id, details.mode);
            this.mapIdCache.setChannelMapId(m.channel.id, score.beatmap.id);
            m.channel.send(await embedSingleScore(modes[score.beatmap.mode_int], score, score.user.username));
        }

        switch (mode) {
            case this.mode.listing: return await listingMode();
            case this.mode.single: return await singleMode();
        }
    }
}
