import { Message, MessageEmbed } from 'discord.js';
import { AlCommand } from './baseCommand';
import { q } from '../../lib/al/index';
import { ERROR_COLOR, SUCCESS_COLOR } from '../../constants/colors';
import { Armor } from '../../constants/al/strings'

const commandName = 'show-ship';
const aliases = [commandName, 'sh'];

export = class extends AlCommand {
    constructor() {
        super(commandName, {
            aliases,
            description: `Show informations of a ship`,
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

        const r = await q.ship_data_statistics['en-US'](
            isNaN(+query) ? { name: query } : { id: +query }
        ).limit(1).exec();
        if (!r.length) return m.channel.send('', err.setDescription(`:frowning: Sorry, nothing matched.`))
        const [{ name, english_name, armor_type, tag_list, id }] = r;
        let [{ type }] = await q.ship_data_template['en-US']({ id }).exec();
        const [{ type_name }] = await q.ship_data_by_type['en-US']({ ship_type: type }).exec();
        const out = new MessageEmbed().setColor(SUCCESS_COLOR)
            .setAuthor(type_name)
            .setTitle(`${name} (${english_name})`)
            .addField(`Tags`, tag_list.map(a => `- ${a}`).join('\n') || 'None', true)
            .addField(`Armour type`, Armor[armor_type], true)

        m.channel.send(out);
    }
}