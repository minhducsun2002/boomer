import { Message, MessageEmbed } from 'discord.js';
import { FgoCommand } from './baseCommand';
import { ERROR_COLOR } from '@pepper/constants/colors';
import search from '@pepper/modules/fgo/servant-name-search';

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
        let search_instance = this.client.moduleHandler.findInstance(search);
        let result = await search_instance.getAlias(alias);
        const err = new MessageEmbed().setColor(ERROR_COLOR);
        let bail = (s : string) => m.channel.send(err.setTitle(s));
        if (result)
            return bail(`\`${alias}\` is already mapped to servant ID ${collectionNo}.`);
        else
            await search_instance.pushAlias(collectionNo, alias, m.author.id)
                .then(() => m.channel.send(
                    new MessageEmbed().setTitle(`Mapped \`${alias}\` to servant ID ${collectionNo}.`)
                ))
    }
}