import { Message, MessageEmbed } from 'discord.js';
import { FgoCommand } from './baseCommand';
import mst from '@pepper/modules/fgo/master-data';
import { ERROR_COLOR } from '../../constants/colors';
import { SvtType } from '@pepper/constants/fgo';
import { mstSvtDocument } from '@pepper/db/fgo/master/mstSvt';
import c from '@pepper/modules/fgo/ce-name-search';
import ce from '@pepper/modules/fgo/ce-details-cache';

const commandName = 'show-craft-essence';
const aliases = [commandName, 'ce']

export = class extends FgoCommand {
    constructor() {
        super(commandName, {
            aliases, 
            args: [{
                id: 'q',
                match: 'rest'
            }],
            description: 'View information of a Craft Essence.',
            typing: true
        })
    }

    async exec(m: Message, { q } : { q: string }) {
        const bail = () => m.channel.send(
            new MessageEmbed().setColor(ERROR_COLOR)
                .setDescription(
                    q
                    ? `I found no matching results. :frowning:`
                    : `:frowning: Where's your query?`
                )
        );
        if (!q) return bail();
        let { JP: { mstSvt } } = this.client.moduleHandler.findInstance(mst);

        // searching method :
        // 
        // Detect if the query is a valid number.
        // A valid number satisfies the following conditions :
        // - greater than 0
        // - integer
        // 1. valid number : use text search.
        // 2. not valid number : try the following methods one by one:
        //    - search as if the query was collectionNo
        //    - search as if the query was id
        //    - use text search
        let results = await this.client.moduleHandler.findInstance(c).search(q),
            useSearch = isNaN(+q) || (!Number.isSafeInteger(+q)) || (!(+q > 0));
        let data : mstSvtDocument;
        if (useSearch && results.length) {
            data = await mstSvt.findOne({ id: results[0].item.id, type: SvtType.SERVANT_EQUIP }).select('id').exec();
        }
        else {
            data = await mstSvt.findOne({ collectionNo: +q, type: SvtType.SERVANT_EQUIP }).select('id').exec();
            if (!data)
                data = await mstSvt.findOne({ id: +q, type: SvtType.SERVANT_EQUIP }).select('id').exec();
            if (!data) {
                if (!results.length) return bail();
                data = await mstSvt.findOne({ id: results[0].item.id, type: SvtType.SERVANT_EQUIP }).select('id').exec();
            }
        }

        if (!data) return bail();

        let _ = await this.client.moduleHandler.findInstance(ce).get(data.id);
        m.channel.send(new MessageEmbed(_));
    }
}