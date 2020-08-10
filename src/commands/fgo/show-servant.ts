import { MessageEmbed, Message } from 'discord.js';
import { FgoCommand } from './baseCommand';
import { paginatedEmbed } from '@pepper/utils'
import { ERROR_COLOR } from '@pepper/constants/colors';
import search from '@pepper/modules/fgo/servant-name-search';
import cache from '@pepper/modules/fgo/servant-details-preprocess';

const commandName = 'servant-info';
const aliases = ['servant', 'servant-info', 's'];

export = class extends FgoCommand {
    constructor() {
        super(commandName, {
            aliases,
            args: [{
                id: 'query',
                match: 'rest',
                description: 'Search query. Can be a servant ID.',
                type: 'string'
            }, {
                id: 'class',
                match: 'option',
                description: 'Filtering by class',
                flag: ['-c', '-c=', '/c:', '--class=', '/class:']
            }],
            typing: true,
            description: 'Show a servant\'s details.',
            cooldown: 1500
        })
    }

    async exec(m: Message,
        { query }: { query?: string }
    ) {
        const err = new MessageEmbed().setColor(ERROR_COLOR);

        if (!query)
            return m.channel.send(
                err.setDescription(':frowning: Where is your query?')
            )

        let search_instance = this.client.moduleHandler.findInstance(search);
        let cache_details = this.client.moduleHandler.findInstance(cache);

        let bail = () => m.channel.send(
            err.setDescription(':disappointed: Sorry, I could not find anything.')
        )

        let _id : number, det = false;
        if (Number.isInteger(+query)) {
            _id = +query;
            det = true;
        }
        else {
            let res = await search_instance.search(query);
            if (!res.length) return bail();
            _id = res[0].item.id;
        }

        let e : MessageEmbed[] = [];
        let cached = await cache_details.get(_id) as any[];
        cached.forEach(s => e.push(new MessageEmbed(s)));
        
        let notice = det ? '' : (
            `Search may not bring up the expected result.`
            + `\nPlease use \`${
                this.handler.findCommand(`ss`)
                    .aliases.sort((a, b) => a.length - b.length)[0]
            }\` command first to search, then call this command again with servant ID.`
        );

        paginatedEmbed()
            .setChannel(m.channel)
            .setEmbeds(e)
            .run({ idle: 20000, dispose: true }, notice)
    }
}
