import { Command } from 'discord-akairo';
import { RichEmbed, Message } from 'discord.js';

import sentence from '../../lib/sentence';
import { constructQuery } from '../../lib/search';

import { ERROR_COLOR, SUCCESS_COLOR, INDETERMINATE_COLOR } from '../../constants/colors'

const commandName = 'servant-skills';
const aliases = ['servant-skills', 'sk', 'sks', 'ssks', 'skills', 'skill'];

interface commandArguments { query?: String; }

export = class extends Command {
    constructor() {
        super(commandName, {
            aliases,
            args:  [{
                id: 'query',
                match: 'rest',
                description: 'Search query',
                type: 'string'
            }],
            typing: true
        })
    }

    async exec (msg: Message, { query } : commandArguments) {
        const wait = new RichEmbed().setDescription(':hourglass: Querying database...')
        const out = await msg.channel.send(wait) as Message;
        const err = new RichEmbed().setColor(ERROR_COLOR);

        if (!query) return out.edit('', err.setDescription(':frowning: Where is your query?'))

        const q = Number.isInteger(+query) ? { id: +query } : { skill: query, name: query }

        const results = await constructQuery(q).select('name id activeSkill').exec();
        if (!results.length)
            return out.edit(
                '', 
                err.setDescription(':frowning: Sorry, but I could not find anything matching.')
            )

        await out.edit(
            '',
            wait.setDescription(`:hourglass: Found record for **${results[0].name}**. Please wait...`)
                .setColor(INDETERMINATE_COLOR)
        )

        const [{ id, name, activeSkill }] = results

        let embed = new RichEmbed().setColor(SUCCESS_COLOR).setTimestamp()
            .setAuthor(`${id}. ${name}`)
            .setTitle('Active skills')
        
        activeSkill.forEach((skillArray, i) => {
            if (i) embed = embed.addBlankField()
            skillArray.forEach(({ name, rank, detail, condition, records, cooldown }) => {
                embed = embed.addField(
                    `**${name}** __[${rank}]__ (${
                        [...new Set(cooldown)].sort((a,b)=>(+b) - (+a)).join('-')
                    })`,
                    detail.split('\n').filter(a=>a).map(a=>`- ${a}`).join('\n') 
                    + `\n`
                    + records.map(
                        ({ effectName : n, effectStrength : s }) => `**[${sentence(n)}]** : ${s.join(' / ')}`
                    ).join('\n')
                    + `\n_(${condition})_`
                )
            })
        })

        out.edit('', embed)
    }
}