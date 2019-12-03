const { Command } = require('discord-akairo');
const { RichEmbed } = require('discord.js');

const escape = require('escape-string-regexp');
const plural = require('../lib/plural');

const { ServantModel: model } = require('../db/model');

const ERROR_COLOR = '#FF0000';
const INDETERMINATE_COLOR = '#FFFF00';
const SUCCESS_COLOR = '#00FF00';

const MAX_RESULTS = 1;

module.exports = class extends Command {
    constructor() {
        super('servant-np', {
            aliases: ['servant-np', 'np', 'snp'],
            args:  [{
                id: 'query',
                match: 'rest',
                description: 'Search query',
                type: 'dynamicInt'
            }]
        })
    }

    async exec(msg, { query }) {
        if (typeof query !== 'number') query = escape(query);
        
        const wait = new RichEmbed().setDescription(':hourglass: Querying database...')
        const out = await msg.channel.send(wait);

        if (!query) return out.edit(
            '', 
            wait.setColor(ERROR_COLOR)
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
                },
                {
                    noblePhantasm: {
                        $elemMatch: { name: stringMatch }
                    }
                }
                // and by alias
            ]
        }).limit(MAX_RESULTS)
            .select('name noblePhantasm id dmgDistribution.np').exec();

        if (!results.length) return out.edit(
            '', 
            wait.setColor(ERROR_COLOR)
                .setDescription(':frowning: Sorry, but I could not find anything matching.')
        )

        await out.edit(
            '',
            wait.setDescription(`:hourglass: Found record for **${results[0].name}**. Please wait...`)
                .setColor(INDETERMINATE_COLOR)
        )

        const [{ name, id, noblePhantasm: np }] = results;

        const embed = new RichEmbed()
            .setColor(SUCCESS_COLOR)
            .setAuthor(`${id}. ${name}`)
            .setTitle(`Noble Phantasm${plural(np.length)}`)

        np.forEach(
            ({ name, extendedName, rank, detail, class: _class, hitcount, records,
                overchargeDetail, overchargeRecords, condition
            }) => {
                embed.addField(
                    `[${_class}] **${name}** __[${rank}]__\n_${extendedName}_`,
                    `Hit count : ${hitcount}`
                    + `\n${detail.split('\n').map(a => `- ${a}`).join('\n')}`
                    + `\n__${overchargeDetail.split('\n').map(a => `- ${a}`).join('\n')}__`
                    + `\n\n${records.map(
                        ({ effectName, effectStrength }) => {
                            if (effectStrength.length)
                                return `**[${effectName.sentence()}]** : ${effectStrength.join(' / ')}`
                            else return ''
                        }
                    ).filter(a=>!!a).join('\n')}`
                    + `\n__${overchargeRecords.map(
                        ({ effectName, effectStrength }) => {
                            if (effectStrength.length)
                                return `**[${effectName.sentence()}]** : ${effectStrength.join(' / ')}`
                            else return ''
                        }
                    ).join('\n')}__`
                    + (condition ? `\n\n_${condition}_` : '')
                )
            }
        )

        out.edit('', embed)
    }
}