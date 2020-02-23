import { Message, MessageEmbed } from 'discord.js';
import { AlCommand } from './baseCommand';
import { ship_data_statistics, ship_data_by_type, ship_data_template } from '../../lib/al/index';
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

        const r = await ship_data_template.cc['en-US'](
            // group_type since I expose/recognize only group type
            isNaN(+query) ? { name: query } : { group_type: +query }
        ).limit(1).exec() as ship_data_template._interface[]
        if (!r.length) return m.channel.send('', err.setDescription(`:frowning: Sorry, nothing matched.`))
        const [{ name, type, group_type, star, id }] = r;
        // english name stays the same for all records
        // same with tag_list
        let [{ english_name, tag_list, armor_type }] = await ship_data_statistics.c["en-US"]({ id: id[0] }).exec()
        const [{ type_name }] = await ship_data_by_type.c['en-US']({ ship_type: type }).exec();
        const out = new MessageEmbed().setColor(SUCCESS_COLOR)
            .setAuthor(type_name)
            .setTitle(`\`${group_type}\` ${name} (${english_name})`)
            .addField(`Tags`, tag_list.map(a => `- ${a}`).join('\n') || 'None', true)
            .addField(`Armour type`, Armor[armor_type], true)

        m.channel.send(out);
    }
}