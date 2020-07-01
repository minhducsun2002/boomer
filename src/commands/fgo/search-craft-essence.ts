import { FgoCommand } from './baseCommand';
import { Message, MessageEmbed } from 'discord.js';
import { constructQuery as c } from '../../lib/fgo/';
import { plural as p } from '@pepper/utils'
import __ from '../../lib/querifySubstring';
import { ERROR_COLOR, SUCCESS_COLOR } from '../../constants/colors';
import { SvtType } from '../../constants/fgo'

const commandName = 'search-craft-essence';
const aliases = [commandName, 'ssc', 'ssce'];

interface a { q?: string; }
const MAX = 25;

export = class extends FgoCommand {
    constructor() {
        super(commandName, {
            aliases,
            description: 'Search for Craft Essences.',
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
        const data = await c.mstSvt({ name: __(q) as any, type: SvtType.SERVANT_EQUIP }).NA.limit(MAX + 1).select('name id').exec();
        if (!data.length) return m.channel.send(err);
        m.channel.send(
            new MessageEmbed()
                .setColor(SUCCESS_COLOR)
                .setTitle(`Found ${data.slice(0, MAX).length} Craft Essence${p(data.length)}.`)
                .setDescription(
                    data.slice(0, MAX).map(({ name, id }) => `\`${id}\` **${name}**`).join('\n')
                )
                .setFooter(data.length === MAX + 1 ? `Only ${MAX} topmost results are shown.` : '')
        )
    }
}