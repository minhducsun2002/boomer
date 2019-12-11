const { Command } = require('discord-akairo');
const { RichEmbed } = require('discord.js');
const escape = require('escape-string-regexp');

const { ServantModel: model } = require('../db/model');

const ERROR_COLOR = '#FF0000';
const INDETERMINATE_COLOR = '#FFFF00';
const SUCCESS_COLOR = '#00FF00';

const MAX_RESULTS = 15;

class Search extends Command {
    constructor() {
        super('search-servants-name-only', {
            aliases: ['search-servants-name', 'ss', 'ssn', 'ssno'],
            args : [{
                id: 'query',
                match: 'rest',
                description: 'Search query'
            },{
                id: 'trait',
                match: 'option',
                description: 'Filtering by trait',
                flag: ['-t', '-t=', '/t:', '--trait=', '/trait:'],
                multipleFlags: true
            },{
                id: 'looseTrait',
                match: 'option',
                description: 'Filtering by trait (allow substring matches, like `female` matching `male`)',
                flag: ['-lt', '-lt=', '/lt:', '--loose-trait=', '/loose_trait:'],
                multipleFlags: true
            },{
                id: '_class',
                match: 'option',
                description: 'Filtering by class',
                flag: ['-c', '-c=', '/c:', '--class=', '/class:'],
                multipleFlags: true
            },{
                id: 'gender',
                match: 'option',
                description: 'Filtering by gender',
                flag: ['-g', '-g=', '/g:', '--gender=', '/gender:'],
            }],
            typing: true,
            description: 'Search for servants. Traits filtering are ANDed, and class filtering are ORed.',
            split: 'sticky',
        });
    }

    async exec(msg, { query, trait, looseTrait, _class, gender }) {
        const embed = new RichEmbed().setDescription(':hourglass: Querying database...')
        const out = await msg.channel.send(embed);

        if (!query && !trait.length && !looseTrait.length && !_class.length && !gender) return out.edit(
            '', 
            embed.setColor(ERROR_COLOR)
                .setDescription(':frowning: Where is your query?')
        )

        if (query) query = escape(query)
        if (trait.length) trait = trait.map(a => escape(a));
        if (looseTrait.length) looseTrait = looseTrait.map(a => escape(a));
        if (_class.length) _class = _class.map(a => escape(a));

        // process query here
        const stringMatch = { $regex: query || '', $options: "i" };

        const results = await model.find({ 
            $and: [{
                $or : [
                    // either name or alias should work
                    { name: stringMatch },
                    // search by name...
                    { 
                        alias: {
                            $elemMatch: stringMatch
                        } 
                    }
                    // and by alias
                ]
            },
            (trait.length ? {
                // for each trait
                $and : trait.map(a => ({ traits: { $elemMatch: { $regex: `^${a}$`, $options: "i" } } }))
                // find servants with `traits` containing the strings matching as a whole
            } : {}),
            (looseTrait.length ? {
                // for each trait
                $and : looseTrait.map(a => ({ traits: { $elemMatch: { $regex: a, $options: "i" } } }))
                // find servants with `traits` containing the strings matching as a superstring
            }: {}),
            (_class.length ? {
                // for each class
                $or : _class.map(a => ({ class: { $regex: a, $options: "i" } }))
                // find servants with `class` 
            } : {}),
            (gender ? {
                gender: { $regex: `^${escape(gender)}$`, $options: "i" }
                // strictly as typed
            } : {})]
        }).limit(MAX_RESULTS)
            .select('class rarity id name').exec();

        if (!results.length) return out.edit(
            '', 
            embed.setColor(ERROR_COLOR)
                .setDescription(':frowning: Sorry, but I could not find anything matching.')
        )

        await out.edit('', 
            embed.setColor(INDETERMINATE_COLOR)
                .setDescription(`:hourglass: Be patient, I found something : ${results.length} servant${
                    results.length > 1 ? 's' : ''
                } match${results.length > 1 ? '' : 'es'} your query.`)
        )

        let result = new RichEmbed()
            .setTitle(`Found ${results.length} servant${results.length > 1 ? 's' : ''}.`)
            .setTimestamp()
            .setDescription(results.slice(0, MAX_RESULTS).map(
                ({
                    class: _class, rarity, id, name
                }) => `[${rarity}:star: ${_class.sentence()}] ${id}. **${name}**`
            ).join('\n'))
            .setColor(SUCCESS_COLOR)

        if (results.length === MAX_RESULTS)
            result = result.setFooter(`Only ${MAX_RESULTS} topmost results are shown.`)
        
        out.edit('', result)
    }
}

module.exports = Search;