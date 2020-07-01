import { Message, MessageEmbed } from 'discord.js';
import { FgoCommand } from './baseCommand';
import { constructQuery as c } from '../../lib/fgo/';
import { ERROR_COLOR, SUCCESS_COLOR } from '../../constants/colors';

const commandName = 'show-item';
const aliases = [commandName, 'item', 'it']
interface a { q?: string }

export = class extends FgoCommand {
    constructor() {
        super(commandName, {
            aliases, 
            args: [{
                id: 'q',
                match: 'rest'
            }],
            description: 'View information of an item.'
        })
    }

    async exec(m: Message, { q }: a) {
        const err = new MessageEmbed().setColor(ERROR_COLOR)
            .setDescription(`Sorry, couldn't find anything that matched.`)
        try {
            let _ = await c.mstItem(isNaN(+q) ? { name: q } : { id: +q }).NA.exec();
            if (!_.length) return m.channel.send(err);
            let [{ name, id, detail, isSell, sellQp, startedAt, endedAt }] = _;
            m.channel.send(
                '',
                new MessageEmbed()
                    .setColor(SUCCESS_COLOR)
                    .setTitle(`${name} (\`${id}\`)`)
                    .setDescription(detail)
                    .addField(`Price tag`, isSell ? `${sellQp} QP` : `Not for sale :thinking:`)
                    .addField(
                        `Availability`,
                        `From \`${new Date(startedAt * 1000).toLocaleString()}\` `
                        + `to \`${new Date(endedAt * 1000).toLocaleString()}\``
                    )
            )
        }
        catch {
            m.channel.send(err.setDescription('Sorry, an error occurred.'))
        }
    }
}