const { Command } = require('discord-akairo');
const { RichEmbed } = require('discord.js');

const { ServantModel: model } = require('../db/model');

const ERROR_COLOR = '#FF0000';
const INDETERMINATE_COLOR = '#FFFF00';
const SUCCESS_COLOR = '#00FF00';

const MAX_RESULTS = 5;

class Search extends Command {
    constructor() {
        super('search', {
            aliases: ['search-servants-detailed', 'ssd'],
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
        const embed = new RichEmbed()
            .setDescription(':hourglass: Querying database...')
        const out = await msg.channel.send(embed);

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
            ]
        }).limit(MAX_RESULTS).exec();
        
        if (!results.length) out.edit(
            '', 
            embed.setColor(ERROR_COLOR)
                .setDescription(':frowning: I could not find anything that match.')
        )
        
        await out.edit('', 
            embed.setColor(INDETERMINATE_COLOR)
                .setDescription(`:hourglass: I found something here : ${results.length} servant${
                    results.length > 1 ? 's' : ''
                } match${results.length > 1 ? '' : 'es'} your query. Wait a little...`)
        )

        let result = new RichEmbed()
            .setTitle(`Found ${results.length} servant${results.length > 1 ? 's' : ''}.`)
            .setTimestamp();

        if (results.length === 5)
            result = result
                .setFooter('Only 5 first matches are shown. Use `ss` to search with higher limits.')
        
        results.slice(0, MAX_RESULTS).forEach(
            ({ 
                class: _class, name, rarity, id, cardSet: set, stats: { hp, atk },
                npGainStat: [npActive, npPassive], criticalStat: [abs, gen], growth
            }) => {
                result = result.addField(
                    `[${rarity} :star: ${_class.sentence()}] ${id}. **${name}**`,
                    `- Card set : ${':red_square: '.repeat(set.buster)}${':blue_square: '.repeat(set.arts)}${':green_square: '.repeat(set.quick)}`
                    + `\n - HP/ATK : ${hp.shift()}/${atk.shift()} - ${hp.pop()}/${atk.pop()}`
                    + `\n - NP gain : ${npPassive} (when hit) / ${npActive} (per attack)`
                    + `\n - C. Star : ${gen} generation per hit, ${abs} absorption`
                    + `\n - Growth curve : ${growth}`
                )
            }
        )

        await out.edit('', result.setColor(SUCCESS_COLOR))
    }
}

module.exports = Search;
