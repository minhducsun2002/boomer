import { OsuCommand } from './baseCommand';
import { Message, MessageEmbed } from 'discord.js';
import axios from 'axios';
import cheerio from 'cheerio';
import { SUCCESS_COLOR, ERROR_COLOR } from '../../constants/colors'

const commandName = 'user';
const aliases = [commandName, 'u'];

interface osuUser {
    id: number;
    username: string;
    join_date: ReturnType<Date['toJSON']>;
    country: { code: string, name: string };
    avatar_url: string;
    is_supporter: boolean; has_supported: boolean;
    is_restricted: boolean;
    is_gmt: boolean; is_nat: boolean; is_bng: boolean;
    is_full_bn: boolean; is_limited_bn: boolean;
    is_bot: boolean; is_active: boolean; is_moderator: boolean;

    location: string;
    last_visit: null | string;
    is_online: boolean;

    statistics: {
        level: { current: number, progress: number },
        pp: number, ranked_score: number, hit_accuracy: number,
        play_count: number, play_time: number, total_score: number, total_hits: number, maximum_combo: number,
        is_ranked: boolean,
        grade_counts: { ss: number, ssh: number, s: number, sh: number, a: number },
        rank: { global: number, country: number }
    }
}

interface osuUserExtra {
    scoresBest: {
        id: number;
        user_id: number;
        accuracy: number;
        mods: string[];
        score: number;
        perfect: boolean;
        pp: number;
        rank: string;
        created_at: ReturnType<Date['toJSON']>;
        max_combo: number;
        beatmap: {
            version: string; id: number; beatmapset_id: number;
            difficulty_rating: number;
            cs: number, drain: number, accuracy: number, ar: number;
        };
        beatmapset: {
            id: number;
            title: string, artist: string, source: string, creator: string;
        }
    }[]
}

export = class extends OsuCommand {
    constructor() {
        super(commandName, {
            aliases,
            description: 'Show stats of an osu! player.',
            args: [{
                id: 'user',
                match: 'rest',
                description: 'Username to search.'
            }]
        })
    }

    async exec(m : Message, { user } = { user: '' }) {
        const err = new MessageEmbed().setColor(ERROR_COLOR)
            .setDescription(`Sorry, couldn't find anyone with username \`${user}\`.`)
        try {
            const _ = await axios.get(`https://osu.ppy.sh/u/${encodeURIComponent(user)}`, {  });
            if (_.status === 404) return m.channel.send(err);
            if (_.status !== 200) throw new Error(`Expected status 200, got status ${_.status}`);
            const dom = cheerio.load(_.data);
            let userdata : osuUser = JSON.parse(dom('#json-user').contents().first().text());
            let {
                username, country: { code: cc }, avatar_url, join_date, id,
                statistics: {
                    level: { current: level },
                    pp, rank, play_count, play_time,
                    ranked_score, total_score, maximum_combo, hit_accuracy,
                    grade_counts: { ss, ssh, s, sh, a }
                } 
            } = userdata;
            let [score] : osuUserExtra['scoresBest'] =
                JSON.parse(dom('#json-extras').contents().first().text()).scoresBest;
            let { beatmapset, beatmap, perfect, mods } = score,
                [_w, _d, _h, _m, _s] = [
                    Math.floor((play_time / (3600 * 24 * 7))),
                    Math.floor((play_time % (3600 * 24 * 7)) / 86400),
                    Math.floor((play_time % 86400) / 3600),
                    Math.floor((play_time % 3600) / 60),
                    Math.floor(play_time % 60)
                ]

            let { ar, drain, difficulty_rating, accuracy, cs } = beatmap;
            let out = new MessageEmbed()
                .setTimestamp().setColor(SUCCESS_COLOR)
                .setTitle(`[${level}] ${username}`)
                .setURL(`https://osu.ppy.sh/users/${id}`)
                .setDescription(
                    `**${pp}**pp (#**${rank.global}** globally | #**${rank.country}** in :flag_${cc.toLowerCase()}:).`
                    + `\n Total accuracy : **${(+hit_accuracy).toFixed(3)}%** | Max combo : **${maximum_combo}**x`
                    + `\nJoined ${new Date(join_date).toLocaleString('en-US')}.`
                )
                .addField('Scores', `${ranked_score} ranked\n${total_score} total`, true)
                .addField('Ranks', `**${ssh}** XH | **${ss}** X\n**${sh}** SH | **${s}** S\n**${a}** A`, true)
                .addField(`Play time`,`${play_count} times | ${_w}w ${_d}d ${_h}h ${_m}m ${_s}s`)
                .addField(
                    `Best performance`,
                    `[**${score.rank}**] **${score.pp}**pp (**${
                        (score.accuracy * 100).toFixed(3)
                    }**% | **${score.max_combo}**x)` + (perfect ? ' (FC)' : '')
                    + `\n[${beatmapset.artist} - ${beatmapset.title} [${beatmap.version}]](https://osu.ppy.sh/beatmaps/${beatmap.id})`
                    + (mods.length ? `+${mods.join('')}` : '')
                    + `\n${difficulty_rating} :star: - \`AR\`**${ar}** \`CS\`**${cs}** \`OD\`**${accuracy}** \`HP\`**${drain}**`
                )

            if (avatar_url.startsWith(`https://`)) out.setThumbnail(avatar_url);
            m.channel.send(out)
        }
        catch {
            m.channel.send(err.setDescription(`Sorry, an error occurred.`));
        }
    }
}