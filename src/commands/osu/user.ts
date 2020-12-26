import { OsuCommand } from './baseCommand';
import { Message, MessageEmbed } from 'discord.js';
import { SUCCESS_COLOR, ERROR_COLOR } from '../../constants/colors'
import { fetchUser } from '@pepper/lib/osu'

import { modes } from '../../constants/osu';

const commandName = 'user';
const aliases = [commandName, 'u'];

export default class extends OsuCommand {
    constructor() {
        super(commandName, {
            aliases,
            description: 'Show stats of an osu! player.',
            args: [{
                id: 'user',
                match: 'rest',
                description: 'Username to search.'
            }, {
                id: 'mode',
                match: 'option',
                description: `Gamemode to show. Can be ${modes.map(a => '`' + a + '`').join(', ')}.`,
                flag: ['/']
            }]
        })
    }

    async exec(m : Message, { user, mode } = { user: '', mode: '' }) {
        user = user.trim();
        if (!modes.includes(mode)) mode = modes[0];
        // check mode
        const err = new MessageEmbed().setColor(ERROR_COLOR)
            .setDescription(`Sorry, couldn't find anyone with username \`${user}\`.`)
        if (!user)
            return m.channel.send(err.setDescription(`Who do you want to search for?`));
        try {
            let userdata = await fetchUser(user, mode);
            let {
                username, country: { code: cc }, avatar_url, join_date, id,
                statistics: {
                    level: { current: level },
                    pp, rank, play_count, play_time,
                    ranked_score, total_score, maximum_combo, hit_accuracy,
                    grade_counts: { ss, ssh, s, sh, a }
                }
            } = userdata.user;
            let [score] = userdata.extra.scoresBest;
            let [_w, _d, _h, _m, _s] = [
                Math.floor((play_time / (3600 * 24 * 7))),
                Math.floor((play_time % (3600 * 24 * 7)) / 86400),
                Math.floor((play_time % 86400) / 3600),
                Math.floor((play_time % 3600) / 60),
                Math.floor(play_time % 60)
            ]

            let out = new MessageEmbed()
                .setTimestamp().setColor(SUCCESS_COLOR)
                .setTitle(`[${level}] ${username}`)
                .setURL(`https://osu.ppy.sh/users/${id}`)
                .setDescription(
                    `**${pp}**pp${
                        rank.global
                        ? ` (#**${rank.global}** globally | #**${rank.country}** in :flag_${cc.toLowerCase()}:)`
                        : ``
                    }.`
                    + `\n Total accuracy : **${(+hit_accuracy).toFixed(3)}%** | Max combo : **${maximum_combo}**x`
                    + `\nJoined ${new Date(join_date).toLocaleString('en-US')}.`
                )
                .addField('Scores', `${ranked_score} ranked\n${total_score} total`, true)
                .addField('Ranks', `**${ssh}** XH | **${ss}** X\n**${sh}** SH | **${s}** S\n**${a}** A`, true)
                .addField(`Play time`,`${play_count} times | ${_w}w ${_d}d ${_h}h ${_m}m ${_s}s`)

            if (score) {
                let { beatmapset, beatmap, perfect, mods } = score,
                    { ar, drain, difficulty_rating, accuracy, cs } = beatmap;
                out.addField(
                    `Best performance`,
                    `[**${score.rank}**] **${score.pp}**pp (**${
                        (score.accuracy * 100).toFixed(3)
                    }**% | **${score.max_combo}**x)` + (perfect ? ' (FC)' : '')
                    + `\n[${beatmapset.artist} - ${beatmapset.title} [${beatmap.version}]](https://osu.ppy.sh/beatmaps/${beatmap.id})`
                    + (mods.length ? `+${mods.join('')}` : '')
                    + `\n${difficulty_rating} :star: - \`AR\`**${ar}** \`CS\`**${cs}** \`OD\`**${accuracy}** \`HP\`**${drain}**`
                )
            }

            if (avatar_url.startsWith(`https://`)) out.setThumbnail(avatar_url);
            m.channel.send(out)
        }
        catch (e) {
            console.log(e)
            m.channel.send(err.setDescription(`Sorry, an error occurred.`));
        }
    }
}
