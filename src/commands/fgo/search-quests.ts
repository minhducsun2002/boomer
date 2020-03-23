import { FgoCommand } from './baseCommand';
import { Message, MessageEmbed } from 'discord.js';
import { constructQuery as c } from '../../lib/fgo/';
import p from '../../lib/plural'
import { ERROR_COLOR, SUCCESS_COLOR } from '../../constants/colors';

const commandName = 'search-quests';
const aliases = [commandName, 'ssq'];

interface a { q?: string; }
const MAX = 20;

export = class extends FgoCommand {
    constructor() {
        super(commandName, {
            aliases,
            description: 'Search for quests.',
            args: [{
                id: 'q',
                match: 'rest',
                description: 'Search query'
            }]
        })
    }

    async exec(m: Message, { q } : a) {
        const err = new MessageEmbed().setColor(ERROR_COLOR)
            .setDescription(
                q
                ? `Sorry, couldn't find anything that matched.`
                : `:frowning: Where's your query?`
            )
        if (!q) return m.channel.send(err);
        const data = await c.mstQuest({ name: q }).NA.limit(MAX).select('name id').exec();
        if (!data.length) return m.channel.send(err);
        m.channel.send(
            new MessageEmbed()
                .setTitle(`Found ${data.length} quest${p(data.length)}.`)
                .setDescription(
                    data.map(({ name, id }) => `\`${id}\` **${name.replace(/\n/g, ' ')}**`).join('\n')
                )
        )
    }
}