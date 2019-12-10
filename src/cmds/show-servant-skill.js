const { Command } = require('discord-akairo');
const { RichEmbed } = require('discord.js');

const plural = require('../lib/plural');

const { ServantModel: model } = require('../db/model');

const ERROR_COLOR = '#FF0000';
const INDETERMINATE_COLOR = '#FFFF00';
const SUCCESS_COLOR = '#00FF00';

const MAX_RESULTS = 1;

module.exports = class extends Command {
    constructor() {
        super('servant-skills', {
            aliases: ['servant-skills', 'sk', 'sks', 'ssks', 'skills', 'skill'],
            args:  [{
                id: 'query',
                match: 'rest',
                description: 'Search query',
                type: 'string'
            }]
        })
    }

    async exec(msg, { query }) {
        const wait = new RichEmbed().setDescription(':hourglass: Querying database...')
        const out = await msg.channel.send(wait);

        if (!query) return out.edit(
            '', 
            wait.setColor(ERROR_COLOR)
                .setDescription(':frowning: Where is your query?')
        )
        
        let results;
        if (Number.isInteger(+query)) {
            results = model.find({ id: +query })
        }
        else {
            // process query here
            const stringMatch = { $regex: query, $options: "i" };

            results = model.find({ 
                $or : [
                    { name: stringMatch },
                    // search by name...
                    { 
                        alias: {
                            $elemMatch: stringMatch
                        } 
                    },
                    {
                        activeSkill: {
                            $elemMatch: {
                                $elemMatch: {
                                    name: stringMatch
                                }
                            }
                        }
                        // [[{ name: "skill name" }]]
                    }
                ]
            })
        }

        [results] = await results.limit(MAX_RESULTS)
            .select('name id activeSkill').exec();

        if (!results) return out.edit(
            '', 
            wait.setColor(ERROR_COLOR)
                .setDescription(':no_entry_sign: No matching record found.')
        )

        await out.edit(
            '',
            wait.setDescription(`:hourglass: Found record for **${results.name}**. Please wait...`)
                .setColor(INDETERMINATE_COLOR)
        )

        const { id, name, activeSkill } = results

        let embed = new RichEmbed().setColor(SUCCESS_COLOR).setTimestamp()
            .setAuthor(`${id}. ${name}`)
            .setTitle('Active skills')
        
        activeSkill.forEach((skillArray, i) => {
            if (i) embed = embed.addBlankField()
            skillArray.forEach(({ name, rank, detail, condition, records, cooldown }) => {
                embed = embed.addField(
                    `**${name}** __[${rank}]__ (${
                        [...new Set(cooldown)].sort((a,b)=>b-a).join('-')
                    })`,
                    detail.split('\n').filter(a=>a).map(a=>`- ${a}`).join('\n') 
                    + `\n`
                    + records.map(
                        ({ effectName : n, effectStrength : s }) => `**[${n.sentence()}]** : ${s.join(' / ')}`
                    ).join('\n')
                    + `\n_(${condition})_`
                )
            })
        })

        out.edit('', embed)
    }
}
