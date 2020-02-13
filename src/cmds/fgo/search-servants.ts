import { MessageEmbed, Message } from 'discord.js';

import { constructQuery } from '../../lib/search';
import { ERROR_COLOR, INDETERMINATE_COLOR, SUCCESS_COLOR } from '../../constants/colors';
import plural from '../../lib/plural';
import sentence from '../../lib/sentence';
import { FgoCommand } from './baseCommand';

const commandName = 'search-servants-name-only';
const aliases = ['search-servants-name', 'ss', 'ssn', 'ssno'];

interface commandArguments {
    query?: string;
    trait?: string[];
    looseTrait?: string[];
    _class?: string[];
    gender?: string;
    attribute?: string;
    alignment?: string;
}

const MAX_RESULTS = 15;

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
                description: 'Filtering by trait',
                flag: ['-t', '-t=', '/t:', '--trait=', '/trait:'],
                multipleFlags: true
            }, {
                id: 'looseTrait',
                match: 'option',
                description: 'Filtering by trait (allow substring matches, like `female` matching `male`)',
                flag: ['-lt', '-lt=', '/lt:', '--loose-trait=', '/loose_trait:'],
                multipleFlags: true
            }, {
                id: '_class',
                match: 'option',
                description: 'Filtering by class',
                flag: ['-c', '-c=', '/c:', '--class=', '/class:'],
                multipleFlags: true
            }, {
                id: 'gender',
                match: 'option',
                description: 'Filtering by gender',
                flag: ['-g', '-g=', '/g:', '--gender=', '/gender:'],
            }],
            typing: true,
            description: 'Search for servants. Traits filtering are ANDed, and class filtering are ORed.'
        })
    }

    async exec(msg: Message, { query, trait, looseTrait, _class, gender, alignment, attribute }: commandArguments) {
        const wait = new MessageEmbed().setDescription(':hourglass: Querying database...')
        const out = await msg.channel.send(wait) as Message;
        const errEmbed = wait.setColor(ERROR_COLOR)

        if (
            !query && !gender && !alignment && !attribute
            && !trait.length
            && !looseTrait.length
            && !_class.length
        )
            return out.edit('', errEmbed.setDescription(':frowning: Where is your query?'))

        const results = await constructQuery({
            name: query,
            traits: trait,
            looseTraits: looseTrait,
            class: _class,
            gender, attribute, alignment
        }, MAX_RESULTS).select('class rarity id name').exec()

        if (!results.length) return out.edit(
            '', errEmbed.setDescription(':frowning: Sorry, but I could not find anything matching.')
        )

        await out.edit('',
            wait.setColor(INDETERMINATE_COLOR)
                .setDescription(`:hourglass: Be patient, I found something : ${results.length} servant${
                        plural(results.length)
                    } match${results.length > 1 ? '' : 'es'} your query.`
                )
        )

        let result = new MessageEmbed()
            .setTitle(`Found ${results.length} servant${results.length > 1 ? 's' : ''}.`)
            .setTimestamp()
            .setDescription(results.slice(0, MAX_RESULTS).map(
                ({
                    class: _class, rarity, id, name
                }) => `[${rarity}:star: ${sentence(_class)}] ${id}. **${name}**`
            ).join('\n'))
            .setColor(SUCCESS_COLOR)

        if (results.length === MAX_RESULTS)
            result = result.setFooter(`Only ${MAX_RESULTS} topmost results are shown.`)
        
        out.edit('', result)
    }
}