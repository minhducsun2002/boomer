import { MessageEmbed, Message } from 'discord.js';
import db from '@pepper/modules/fgo/servant-name-search';
import traits from '@pepper/modules/fgo/servant-trait-search';
import { FgoCommand } from './baseCommand';
import { findSetIntersection, chunk, paginatedEmbed } from '@pepper/utils';
import { Trait } from '@pepper/constants/fgo';
import { Trait as traitString } from '@pepper/constants/fgo/strings';
import f from 'fuse.js';

let availableTraits = new Set(Object.values(Trait));

const commandName = 'search-servants-name-only';
const aliases = ['search-servants-name', 'ss', 'ssn', 'ssno'];

export = class extends FgoCommand {
    constructor() {
        super(commandName, {
            aliases,
            args: [{
                id: 'query',
                match: 'rest',
                description: 'Search query'
            }, {
                id: 'trait',
                match: 'option',
                description: 'Filtering by trait ID',
                flag: ['-t', '-t=', '/t:', '--trait=', '/trait:'],
                multipleFlags: true,
                type: 'string'
            }],
            typing: true,
            description: 'Search for servants, optionally with traits.'
        })
    }

    private fuse = new f(
        Object.values(Trait).filter(a => isNaN(+a))
            .map((traitName : keyof typeof traitString) => ({
                trait: +Trait[traitName] as Trait,
                traitName: traitString[+Trait[traitName] as keyof typeof traitString] || `\`${traitName}\``
            })),
        { keys: ['traitName'], shouldSort: true, includeScore: true, minMatchCharLength: 1, ignoreLocation: true }
    )

    MAX_RESULTS = 15;
    private resolveTrait(trait : string) {
        return this.fuse.search(trait).map(res => res.item)[0];
    }

    async exec(m: Message, { query, trait } : { query: string, trait: string[] }) {
        query = query ?? '';
        let qTrait = (trait || []).map(a => isNaN(+a) ? this.resolveTrait(a).trait : +a)
            .filter(Boolean)
            .filter(_ => availableTraits.has(_));

        if (!qTrait.length && !query)
            return m.channel.send(`Please specify a query :frowning:`);

        let _db = this.client.moduleHandler.findInstance(db);
        let _traits = this.client.moduleHandler.findInstance(traits);
        let results = query ? _db.search(query) : _db.records.map(a => ({ item: a }));
        if (qTrait.length) {
            // build a list of servants matching the queries
            let matchings = qTrait.map(t => new Set(_traits.trait(t)));
            let match = findSetIntersection(...matchings);

            results = results.filter(_ => match.has(_.item.id));
        }

        if (!results.length)
            return m.channel.send(`I found no matching results. :frowning:`);

        let r = chunk(results.map(a => a.item), this.MAX_RESULTS);

        let render = (_ : typeof r[0]) => new MessageEmbed()
            .setTitle(`Search results` + (query ? ` for \`${query}\`` : ''))
            .setDescription(_.map(s => `[${s.rarity}★] ${s.id}. **${s.name}**`))
            .addFields(
                qTrait.length
                ? [{
                    name: `Queried traits`,
                    value: qTrait.map(t => `[${traitString[t as keyof typeof traitString] || t}]`).join(`, `)
                }] : []
            )

        if (r.length === 1)
            return m.channel.send(render(r[0]));
        else
            paginatedEmbed()
                .setChannel(m.channel)
                .setEmbeds(
                    r.map(render).map((m, i, a) => m.setFooter(`Page ${i + 1}/${a.length}`))
                )
                .run(
                    { idle: 20000, dispose: true },
                    `Migration is in progress; please add servant aliases you see fit to <https://shrtco.de/i1HKZD>.`
                )
    }
}