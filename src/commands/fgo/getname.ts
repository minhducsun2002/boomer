import { Message, MessageEmbed } from 'discord.js';
import { FgoCommand } from './baseCommand';
import { ERROR_COLOR, SUCCESS_COLOR } from '@pepper/constants/colors';
import { SvtType } from '@pepper/constants/fgo';
import search from '@pepper/modules/fgo/servant-name-search';
import master from '@pepper/modules/fgo/master-data';

const commandName = 'getname';
const aliases = [commandName, 'getnames'];

export = class extends FgoCommand {
    constructor() {
        super(commandName, {
            aliases,
            description: `List aliases for a servant.`,
            typing: true,
            args: [{
                id: 'collectionNo',
                match: 'phrase',
                type: 'number',
                description: 'Servant ID to list aliases.'
            }]
        })
    }

    async exec(m : Message, { collectionNo } : { collectionNo: number }) {
        const err = new MessageEmbed().setColor(ERROR_COLOR);
        let bail = (s : string) => m.channel.send(err.setDescription(s));
        let search_instance = this.client.moduleHandler.findInstance(search),
            master_data = this.client.moduleHandler.findInstance(master)

        let verify = async () => await master_data.JP.mstSvt.findOne({
            $or: [
                { type: SvtType.HEROINE, collectionNo },
                { type: SvtType.NORMAL, collectionNo },
                { type: SvtType.ENEMY_COLLECTION_DETAIL, collectionNo }
            ]
        }).exec();
        
        if (!(Number.isSafeInteger(collectionNo) && (await verify())))
            return bail(`Please specify a valid servant ID.`)

        let res = await search_instance.listAlias(collectionNo);
        if (!res.length)
            return bail(`There's no custom alias for servant ID ${collectionNo}.`);
        else
            m.channel.send(
                new MessageEmbed()
                    .setTitle(`Custom alias${res.length > 1 ? 'es' : ''} for servant ID ${collectionNo}`)
                    .setDescription(res.map(_ => `- \`${_.alias}\``).join('\n'))
                    .setColor(SUCCESS_COLOR)
            )
    }
}