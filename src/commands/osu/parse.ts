import { MessageEmbed, Message } from 'discord.js';
import axios from 'axios';
import ojsama from 'ojsama';
import { OsuCommand } from './baseCommand';
import { ERROR_COLOR, SUCCESS_COLOR } from '../../constants/colors';
import { Replay } from '@minhducsun2002/node-osr-parser';
import { mode_friendly } from '../../constants/osu';
import { modToString, accuracy } from '../../lib/osu/utils';
import Bot from '../../';

const commandName = 'parse';
const aliases = [commandName, 'replay', 'sr'];
const { OSU_API_KEY: key } = process.env;

export = class extends OsuCommand {
    constructor() {
        super(commandName, {
            aliases,
            description: 'Parse a replay file',
            cooldown: 5000,
            // 5 secs,
            args: [{
                id: 'pp',
                type: 'flag',
                description: 'Whether to calculate pp for this replay.',
                flag: ['/pp']
            }]
        })
    }

    async exec(m : Message, { pp } = { pp: false }) {
        const err = new MessageEmbed().setColor(ERROR_COLOR)
            .setDescription(`Sorry, could not parse your replay.`)
        let _ = m.attachments.array().filter(a => a.name.endsWith('.osr'));
        if (!_.length)
            return m.channel.send(err.setDescription('Please attach at least one `.osr` file.'));
        
        let replay;
        try {
            let __ = await axios.get(`${_[0].url}`, { validateStatus: () => true, responseType: 'arraybuffer' })
            if (__.status !== 200)
                return m.channel.send(err.setDescription(`Sorry, could not load your replay.`))

            replay = await new Replay(Buffer.from(__.data, 'binary')).deserialize();
        } catch {
            return m.channel.send(err);
        }
        let { player, timestamp, score, gamemode, maxCombo, perfect, mods, version, md5map, accuracies } = replay as Replay;
        let _m = modToString(mods), inline = true;
        await m.channel.send(
            new MessageEmbed()
                .setColor(SUCCESS_COLOR)
                .setAuthor(`osu! version ${version}`)
                .setTitle(`${mode_friendly[gamemode]} replay by **${player}**`)
                .addFields([
                    { name: 'Score', value: `${score}\n**${
                        (100 * accuracy[gamemode as keyof typeof accuracy](accuracies)).toFixed(3)
                    }**% - **${maxCombo}**x ${perfect ? '(Perfect)' : ''}`, inline },
                    { name: 'Timestamp', value: timestamp.toLocaleString('en-US'), inline },
                    { name: 'Mods', value: _m.join(', ') || 'None', inline }
                ])
        );

        // attempts to load beatmap
        if (key) {
            try {
                let __ = await axios.get(`https://osu.ppy.sh/api/get_beatmaps?k=${key}&h=${md5map}`, { responseType: 'json' })
                if (__.data.length) {
                    let _ = (this.client as Bot).cmdHandler;
                    _.runCommand(m, _.findCommand(`beatmap`), { beatmap: __.data[0].beatmap_id });
                    if (pp) {
                        _.runCommand(
                            m, 
                            _.findCommand(`pp`),
                            {
                                beatmap: __.data[0].beatmap_id,
                                accuracy: (accuracy[gamemode as keyof typeof accuracy](accuracies) * 100).toFixed(4),
                                mods: ojsama.modbits.string(mods),
                                combo: maxCombo
                            }
                        );
                    }
                }
            } catch {}
        }

        
    }
}