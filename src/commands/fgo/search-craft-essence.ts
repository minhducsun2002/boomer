import { FgoCommand } from './baseCommand';
import { Message, MessageEmbed } from 'discord.js';
import { chunk, paginatedEmbed } from '@pepper/utils'
import { ERROR_COLOR } from '@pepper/constants/colors';
import c from '@pepper/modules/fgo/ce-name-search';

const commandName = 'search-craft-essence';
const aliases = [commandName, 'ssc', 'ssce'];

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

    MAX_RESULTS = 15;

    async exec(m: Message, { q } : { q?: string; }) {
        const err = new MessageEmbed().setColor(ERROR_COLOR)
            .setDescription(
                q
                ? `Sorry, couldn't find anything that matched.`
                : `:frowning: Where's your query?`
            )
        if (!q) return m.channel.send(err);
        let results = await this.client.moduleHandler.findInstance(c).search(q);

        if (!results.length)
            return m.channel.send(`I found no matching results. :frowning:`);

        let r = chunk(results.map(a => a.item), this.MAX_RESULTS);

        let render = (_ : typeof r[0]) => new MessageEmbed()
            .setTitle(`Search results` + (q ? ` for \`${q}\`` : ''))
            .setDescription(_.map(s => `${s.collectionNo}. **${s.name}**`))

        if (r.length === 1)
            return m.channel.send(render(r[0]));
        else
            paginatedEmbed()
                .setChannel(m.channel)
                .setEmbeds(
                    r.map(render).map((m, i, a) => m.setFooter(`Page ${i + 1}/${a.length}`))
                )
                .run({ idle: 20000, dispose: true })
    }
}