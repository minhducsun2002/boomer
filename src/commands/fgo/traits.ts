import { Message, MessageEmbed } from 'discord.js';
import { FgoCommand } from './baseCommand';
import { Trait } from '@pepper/constants/fgo';
import { Trait as t } from '@pepper/constants/fgo/strings';
import { chunk, paginatedEmbed } from '@pepper/utils';
import f from 'fuse.js';

const commandName = 'servant-traits';
const aliases = ['t', 'trait', 'traits'];

export = class extends FgoCommand {
    constructor() {
        super(commandName, {
            aliases,
            description: `List all known traits.`,
            typing: true,
            args: [{
                id: 'query',
                match: 'rest',
                description: 'Search for relevant traits'
            }]
        })
    }

    MAX_ENTRIES = 20;
    async exec(m : Message, { query } = { query: '' }) {
        let traits = Object.values(Trait).filter(a => isNaN(+a))
            .map((traitName : keyof typeof t) => ({
                trait: Trait[traitName],
                traitName: t[+Trait[traitName] as keyof typeof t] || `\`${traitName}\``
            }));
        let results = query
            ? new f(
                traits,
                { keys: ['traitName'], shouldSort: true, includeScore: true, minMatchCharLength: 1, ignoreLocation: true }
            ).search(query).map(res => res.item)
            : traits;

        let pages = chunk(results.map(_ => `\`${_.trait}\` ${_.traitName}`), this.MAX_ENTRIES)
            .map(list => new MessageEmbed()
                .setTitle(query ? `Trait search results for \`${query}\`` : `Known traits`)
                .setDescription(list.join('\n'))
            );


        if (pages.length == 1)
            m.channel.send(pages);
        else
            paginatedEmbed()
                .setChannel(m.channel)
                .setEmbeds(pages)
                .run({ idle: 20000, dispose: true })
    }
}