import { MessageEmbed, Message } from 'discord.js';
import { FgoCommand } from './baseCommand';
import search from '@pepper/modules/fgo/servant-name-search';
import td from '@pepper/modules/fgo/np-details-cache';
import { paginatedEmbed } from '@pepper/utils';

const commandName = 'servant-np';
const aliases = ['servant-np', 'np', 'snp'];

export = class extends FgoCommand {
    constructor() {
        super(commandName, {
            aliases,
            args: [{
                id: 'query',
                match: 'rest',
                description: 'Search query'
            }],
            typing: true,
            description: "Show a servant's Noble Phantasm."
        })
    }

    async exec(m: Message, { query } : { query: string }) {
        const bail = () => m.channel.send(
            new MessageEmbed().setDescription(':frowning: Sorry, but I could not find anything matching.')
        );

        if (!query) return bail();

        let _id = +query;
        if (isNaN(_id)) {
            let search_instance = this.client.moduleHandler.findInstance(search);
            let alias = await search_instance.getAlias(query);
            if (alias)
                _id = alias.collectionNo;
            else {
                let res = search_instance.search(query);
                if (!res.length) return bail();
                _id = res[0].item.id;
            }
        }

        let embeds = (await this.client.moduleHandler.findInstance(td).get(_id)).map(data => new MessageEmbed(data));
        if (embeds.length > 1)
            paginatedEmbed()
                .setChannel(m.channel)
                .setEmbeds(
                    embeds.map((embed, i, _) => embed.setFooter(`Page ${i + 1}/${_.length}`))
                )
                .run({ idle: 20000, dispose: true })
        else
            m.channel.send(embeds[0]);
    }
}
