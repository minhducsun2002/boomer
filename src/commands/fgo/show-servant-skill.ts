import { MessageEmbed, Message } from 'discord.js';
import search from '@pepper/modules/fgo/servant-name-search';
import { FgoCommand } from './baseCommand';
import skill from '@pepper/modules/fgo/skill-details-cache';

const commandName = 'servant-skills';
const aliases = ['servant-skills', 'sk', 'sks', 'ssks', 'skills', 'skill'];

export = class extends FgoCommand {
    constructor() {
        super(commandName, {
            aliases,
            args:  [{
                id: 'query',
                match: 'rest',
                description: 'Search query',
                type: 'string'
            }],
            typing: true,
            description: "Show a servant's skills."
        })
    }

    async exec (m: Message, { query } : { query: string; }) {
        const bail = () => m.channel.send(
            new MessageEmbed().setDescription(':frowning: Sorry, but I could not find anything matching.')
        );

        if (!query) return bail();

        let _id = +query;
        if (isNaN(_id)) {
            let res = await this.client.moduleHandler.findInstance(search)
                .search(query);
            if (!res.length) return bail();
            _id = res[0].item.id;
        }

        let cache_details = this.client.moduleHandler.findInstance(skill);

        m.channel.send(new MessageEmbed(await cache_details.get(_id)));
    }
}
