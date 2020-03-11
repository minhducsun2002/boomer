import { Message, MessageEmbed } from 'discord.js';
import { FgoCommand } from './baseCommand';
import { constructQuery as c } from '../../lib/fgo/';
import { ERROR_COLOR, SUCCESS_COLOR } from '../../constants/colors';
import { log } from '../../lib/logger';
import p from '../../lib/plural';

const commandName = 'search-spot';
const aliases = [commandName, 'ssp']
const MAX_QUEST = 25;
interface a { q?: string }

export = class extends FgoCommand {
    constructor() {
        super(commandName, {
            aliases, 
            args: [{
                id: 'q',
                match: 'rest'
            }],
            description: 'Search for spots.',
            typing: true
        })
    }

    async exec(m: Message, { q }: a) {
        const err = new MessageEmbed().setColor(ERROR_COLOR)
            .setDescription(`Sorry, couldn't find anything that matched.`)
        try {
            let a = +q;
            let _ = await c.mstSpot(isNaN(a) ? { name: q } : { id: a }, MAX_QUEST + 1)
                .NA.select('name id').exec();
            
            let out = new MessageEmbed()
                .setColor(SUCCESS_COLOR)
                .setTitle(`Found ${Math.min(MAX_QUEST, _.length)} spot${p(_.length)}.`)
                .setDescription(_.map(({ name, id }) => `\`${id}\` **${name}**`).join('\n'))
            m.channel.send(out)
        }
        catch (e) {
            let _ : Error = e;
            log.error(`${_.name}: ${_.message}\n${_.stack}`)
            m.channel.send(err.setDescription('Sorry, an error occurred.'))
        }
    }
}