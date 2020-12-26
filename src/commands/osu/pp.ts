import { OsuCommand } from './baseCommand';
import { Message, MessageEmbed } from 'discord.js';
import axios from 'axios';
import oj from 'ojsama';
import { mode_friendly } from '@pepper/constants/osu';
import { ERROR_COLOR, SUCCESS_COLOR } from '../../constants/colors';

const commandName = 'pp', aliases : string[] = [commandName];

export = class extends OsuCommand {
    constructor() {
        super(commandName, {
            aliases,
            typing: true,
            description: 'Calculate PP for a certain play.',
            args: [{
                id: 'beatmap',
                match: 'phrase',
                type: 'string',
                description: 'Beatmap ID'
            }, {
                id: 'accuracy',
                match: 'phrase',
                type: ({}, p : string) : number => {
                    let _ = +(p.endsWith('%') ? p.slice(0, -1) : p).trim();
                    return (isNaN(_) || (_ < 0) || (_ > 100)) ? null : _;
                },
                description: 'Accuracy, e.g. `90%` or `90`'
            }, {
                id: 'combo',
                match: 'phrase',
                type: ({}, p : string) : number => {
                    let _ = +(p.endsWith('x') ? p.slice(0, -1) : p).trim();
                    return (isNaN(_) || (_ < 0)) ? null : _;
                },
                description: 'Maximum combo count, e.g. `200x` or `200`'
            }, {
                id: 'mods',
                match: 'phrase',
                type: 'string',
                description: 'Mods used, e.g. `HDDTHRPF`'
            }, {
                id: 'misses',
                match: 'phrase',
                type: 'number',
                description: 'Misses count. Can be omitted.'
            }]
        })
    }

    async exec(m : Message, { beatmap: mapId, accuracy, combo, mods, misses } = { beatmap: '', accuracy: 100, combo: 0, mods: '', misses: 0 }) {
        const err = new MessageEmbed().setColor(ERROR_COLOR)
            .setDescription(`Sorry, an error occurred.`)
        let _ = +mapId;

        if (isNaN(_))
            return m.channel.send(err.setDescription('You passed an invalid beatmap ID!'));

        if (!((accuracy <= 100) || (accuracy >= 0))) accuracy = 100;
        if (!combo || isNaN(combo)) combo = undefined;
        if (!mods) mods = '';

        try {
            let _ = await axios.get(`https://osu.ppy.sh/osu/${mapId}`, { validateStatus: () => true });
            if (_.status === 404) return m.channel.send(`Sorry, could not find your beatmap.`);
            if (_.status !== 200) throw new Error(
                `Error getting beatmap : Expected status 200, got status ${_.status}.`
            );
            let beatmap = new oj.parser();
            beatmap.feed(_.data);
            let map = beatmap.map;
            let diff = new oj.diff().calc({ map, mods: oj.modbits.from_string(mods) });
            let pp = oj.ppv2({ stars: diff, combo, nmiss: misses, acc_percent: accuracy }).total.toFixed(4);
            let { title_unicode, title, version, artist_unicode, artist, ar, cs, od, hp, mode, creator } = map;
            m.channel.send(
                new MessageEmbed()
                    .setColor(SUCCESS_COLOR)
                    .setAuthor(mode_friendly[mode])
                    .setTitle(`${artist_unicode || artist} - ${title_unicode || title} [${version}]`)
                    .setDescription(`_by [${creator}](https://osu.ppy.sh/u/${encodeURI(creator)})_`)
                    .setURL(`https://osu.ppy.sh/beatmaps/${mapId}`)
                    .addField(
                        `Difficulty`,
                        `**${(diff.aim + diff.speed).toFixed(3)}**\u2605 (**${
                            diff.aim.toFixed(3)
                        }** aim | **${
                            diff.speed.toFixed(3)
                        }** speed)`
                        + `\n\`AR\`**${ar}** \`CS\`**${cs}** \`OD\`**${od}** \`HP\`**${hp}**`,
                    )
                    .addField(`PP`, pp, true)
                    .addField(`Mods`, oj.modbits.string(oj.modbits.from_string(mods)) || 'None', true)
                    .addField(`Combo`, `**${combo ? combo : map.max_combo()}**x`, true)
                    .addField(`Accuracy`, `**${accuracy}**%`, true)
                    .addField(`Misses`, misses ? misses : 0, true)
            );
        } catch (e) {
            m.channel.send(err.setDescription(`Sorry, an error occurred.` + '```' + e + '```'));
        }
    }
}
