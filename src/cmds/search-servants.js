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
            }],
            typing: true,
            description: 'Search for servants.'
        });
    }

    async exec(msg, { query }) {
        query = escape(query)

        const embed = new RichEmbed().setDescription(':hourglass: Querying database...')
        const out = await msg.channel.send(embed);

        if (!query) return out.edit(
            '', 
            embed.setColor(ERROR_COLOR)
                .setDescription(':frowning: Where is your query?')
        )

        // process query here
        const stringMatch = { $regex: query, $options: "i" };

        const results = await model.find({ 
            $or : [
                { name: stringMatch },
                // search by name...
                { 
                    alias: {
                        $elemMatch: {...stringMatch}
                    } 
                }
                // and by alias
            ]
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