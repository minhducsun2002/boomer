import { Message, MessageEmbed } from 'discord.js';
import { AlCommand } from './baseCommand';
import { ship_data_statistics, ship_data_by_type, ship_data_template, gametip, ship_data_group } from '../../lib/al/';
import { ERROR_COLOR, SUCCESS_COLOR } from '../../constants/colors';
import { Armor } from '../../constants/al/strings';
import { NationKey, FactionKey } from '../../constants/al'

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
        let err = new MessageEmbed().setColor(ERROR_COLOR),
            // group_type since I expose/recognize only group type
            q = isNaN(+query) ? { name: query } : { group_type: +query }

        if (!query) return m.channel.send('', err.setDescription(':frowning: Where is your query?'))

        const r = await ship_data_template.cc['en-US'](q).exec() as ship_data_template._interface[]

        if (!r.length) return m.channel.send('', err.setDescription(`:frowning: Sorry, nothing matched.`))

        const [{ type, group_type, id }] = r;
        const [{ name: cn }] = await ship_data_statistics.c['zh-CN']({ id: id[0] }).exec()
        // english name stays the same for all records, 1st time is enough
        // same with tag_list
        let [{ english_name, tag_list, armor_type, rarity: _rare, nationality }] = await ship_data_statistics.c["en-US"]({ id: id[0] }).exec()
        const [
            [{ tip: nation }],
            [{ tip: faction }],
            [{ type_name }],
            [{ code, description }],
            [{ tip: rarity }]
        ] = await Promise.all([
            gametip.c['en-US']({ id: NationKey[nationality] }).exec(),
            gametip.c['en-US']({ id: FactionKey[nationality] }).exec(),
            ship_data_by_type.c['en-US']({ ship_type: type }).exec(),
            ship_data_group.c['en-US']({ group_type }).exec(),
            gametip.c['en-US']({ id: `index_rare${_rare}` }).exec()
        ])

        const out = new MessageEmbed().setColor(SUCCESS_COLOR)
            .setAuthor(`${rarity} ${type_name}`)
            .setTitle(`\`${group_type}\` ${code}. ${english_name} - ${cn}`)
            .addField(`Nation`, `${faction}/${nation}`, true)
            .addField(`Armour type`, Armor[armor_type], true)
            .addField(`Obtainable through`, description.slice(0).map(([a]) => `- ${a}`).join('\n'))
            // .addField(`Tags`, tag_list.map(a => `- ${a}`).join('\n') || 'None', true)

        m.channel.send(out);
    }
}