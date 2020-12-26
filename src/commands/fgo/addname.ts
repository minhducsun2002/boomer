import { Message, MessageEmbed } from 'discord.js';
import { FgoCommand } from './baseCommand';
import { ERROR_COLOR, SUCCESS_COLOR } from '@pepper/constants/colors';
import { SvtType } from '@pepper/constants/fgo';
import search from '@pepper/modules/fgo/servant-name-search';
import master from '@pepper/modules/fgo/master-data';

const commandName = 'addname';
const aliases = [commandName];

export = class extends FgoCommand {
    constructor() {
        super(commandName, {
            aliases,
            description: `Add an alias for a servant.`,
            typing: true,
            args: [{
                id: 'collectionNo',
                match: 'phrase',
                type: 'number',
                description: 'Servant ID to add the alias for.'
            }, {
                id: 'alias',
                match: 'phrase',
                type: 'string',
                description: 'The alias to add.'
            }]
        })
    }

    async exec(m : Message, { collectionNo, alias } : { collectionNo: number, alias: string }) {
        let search_instance = this.client.moduleHandler.findInstance(search),
            master_data = this.client.moduleHandler.findInstance(master);

        const err = new MessageEmbed().setColor(ERROR_COLOR);
        let bail = (s : string) => m.channel.send(err.setTitle(s));

        let verify = async () => await master_data.JP.mstSvt.findOne({
            $or: [
                { type: SvtType.HEROINE, collectionNo },
                { type: SvtType.NORMAL, collectionNo },
                { type: SvtType.ENEMY_COLLECTION_DETAIL, collectionNo }
            ]
        }).exec();

        if (!(Number.isSafeInteger(collectionNo) && (await verify())))
            return bail(`Please specify a valid servant ID.`)

        if (!alias)
            return bail(`Please specify an to map to servant ID ${collectionNo}.`)

        if (await search_instance.getAlias(alias))
            return bail(`\`${alias}\` is already mapped to servant ID ${collectionNo}.`);
        else
            await search_instance.pushAlias(collectionNo, alias, m.author.id)
                .then(() => m.channel.send(
                    new MessageEmbed().setTitle(`Mapped \`${alias}\` to servant ID ${collectionNo}.`).setColor(SUCCESS_COLOR)
                ))
    }
}