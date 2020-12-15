import { Message, MessageEmbed } from 'discord.js';
import { FgoCommand } from './baseCommand';
import { ERROR_COLOR, SUCCESS_COLOR } from '@pepper/constants/colors';
import search from '@pepper/modules/fgo/servant-name-search';

const commandName = 'getname';
const aliases = [commandName, 'getnames'];

export = class extends FgoCommand {
    constructor() {
        super(commandName, {
            aliases,
            description: `List aliases for a servant.`,
            typing: true,
            args: [{
                id: 'query',
                match: 'phrase',
                type: 'string',
                description: 'Search query for a servant. Could be an alias or a servant ID.'
            }]
        })
    }

    async exec(m : Message, { query } : { query: string }) {
        const err = new MessageEmbed().setColor(ERROR_COLOR);
        let bail = (s : string) => m.channel.send(err.setDescription(s));
        let search_instance = this.client.moduleHandler.findInstance(search)

        let servantId = +query;
        if (isNaN(servantId)) servantId = (await search_instance.getAlias(query))?.collectionNo;
        
        if (!Number.isSafeInteger(servantId))
            return bail(`Please specify a valid servant ID or alias.`)

        let res = await search_instance.listAlias(servantId);
        if (!res.length)
            return bail(`There's no custom alias for servant ${query}.`);
        else
            m.channel.send(
                new MessageEmbed()
                    .setTitle(`Custom alias${res.length > 1 ? 'es' : ''} for servant ID ${servantId}`)
                    .setDescription(res.map(_ => `- \`${_.alias}\``).join('\n'))
                    .setColor(SUCCESS_COLOR)
            )
    }
}