import { Message, MessageEmbed } from 'discord.js';
import { AlCommand } from './baseCommand';
import { ship_data_template, interfaces as i } from '../../lib/al/';
import { ERROR_COLOR, SUCCESS_COLOR } from '../../constants/colors';

const commandName = 'search-ships';
const aliases = [commandName, 'ssh'];
const MAX = 20;

export = class extends AlCommand {
    constructor() {
        super(commandName, {
            aliases,
            description: `Search for ships. There might be duplicates - that is how the game treats LBs`,
            args: [{
                id: 'query',
                match: 'rest',
                description: 'Search query'
            }],
            typing: true
        })
    }

    async exec(m : Message, { query } = { query: '' }) {
        const err = new MessageEmbed().setColor(ERROR_COLOR);
        if (!query) return m.channel.send('', err.setDescription(':frowning: Where is your query?'))

        const r = (await ship_data_template.c["en-US"]({
            name: query
        }, MAX + 1).exec()) as i['ship_data_template'][]

        if (!r.length) return m.channel.send('', err.setDescription(`:frowning: No match found, sorry.`))

        const out = new MessageEmbed()
            .setTitle(`Found ${Math.min(r.length, MAX)} ship${r.length > 1 ? 's' : ''}.`)
            .setTimestamp()
            .setDescription(
                r.slice(0, MAX)
                    .map(({ name, star, group_type }) => `\`${group_type}\` ${
                        // star
                        star.reduce((a, b) => Math.max(a, b))
                    } :star: **${name}**`)
                    .join('\n')
            )
            .setColor(SUCCESS_COLOR)
        if (r.length > 20)
            out.setFooter(`Only ${MAX} topmost results are shown.`)
        m.channel.send(out);
    }
}