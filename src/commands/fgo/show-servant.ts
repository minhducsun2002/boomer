import { MessageEmbed, Message } from 'discord.js';
import { FgoCommand } from './baseCommand';
import { paginatedEmbed } from '@pepper/utils'
import { ERROR_COLOR } from '@pepper/constants/colors';
import search from '@pepper/modules/fgo/servant-name-search';
import cache from '@pepper/modules/fgo/servant-details-preprocess';
import mst from '@pepper/modules/fgo/master-data';

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
        let bail = (s? : string) => m.channel.send(
            err.setDescription(s || ':disappointed: Sorry, I could not find anything.')
        )

        if (!query) return bail(':frowning: Where is your query?');

        let search_instance = this.client.moduleHandler.findInstance(search);
        let cache_details = this.client.moduleHandler.findInstance(cache);
        let master = this.client.moduleHandler.findInstance(mst);

        let _id : number, det = false;
        if (Number.isInteger(+query)) {
            _id = +query;
            det = true;
        }
        else {
            let alias = await search_instance.getAlias(query);
            if (alias)
                _id = alias.collectionNo;
            else {
                let res = search_instance.search(query);
                if (!res.length) return bail();
                _id = res[0].item.id;
            }
        }

        let e : MessageEmbed[] = [], cached: any[] = [], found = true;
        try {
            cached = await cache_details.get(_id);
        } catch {
            // not found, last try
            let svt = await master.JP.mstSvt.findOne({ id: _id }).select('collectionNo').exec();
            if (!svt) found = false;
            try { cached = await cache_details.get(svt.collectionNo); } catch { found = false; }
        }

        if (!found)
            return bail(
                det ? (
                    `Did you search for servant with ID \`${_id}\`?`
                    + `\nIf you did, please note that I can only show playable servants,`
                    + `\nso Solomon, Tiamat & the likes won't be displayed. :frowning:`
                    + `\nIt is also possible that no servants with such ID exist.`
                ) : ''
            );

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
