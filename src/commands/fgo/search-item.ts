import { Message, MessageEmbed } from 'discord.js';
import { FgoCommand } from './baseCommand';
import { constructQuery as c } from '../../lib/fgo/';
import { ERROR_COLOR, SUCCESS_COLOR } from '../../constants/colors';
import { plural as p } from '@pepper/utils' ;

const commandName = 'search-item';
const aliases = [commandName, 'ssit']
const MAX_ITEM = 25;
interface a { q?: string }

export = class extends FgoCommand {
    constructor() {
        super(commandName, {
            aliases, 
            args: [{
                id: 'q',
                match: 'rest'
            }],
            description: 'Search for items.',
            typing: true
        })
    }

    async exec(m: Message, { q }: a) {
        const err = new MessageEmbed().setColor(ERROR_COLOR)
            .setDescription(`Sorry, couldn't find anything that matched.`)
        try {
            let a = +q;
            let _ = await c.mstItem(isNaN(a) ? { name: q } : { id: a }, MAX_ITEM + 1)
                .NA.select('name id').exec();
            
            let out = new MessageEmbed()
                .setColor(SUCCESS_COLOR)
                .setTitle(`Found ${Math.min(MAX_ITEM, _.length)} item${p(_.length)}.`)
                .setDescription(_.map(({ name, id }) => `\`${id}\` **${name}**`).join('\n'))
            m.channel.send(out)
        }
        catch {
            m.channel.send(err.setDescription('Sorry, an error occurred.'))
        }
    }
}