import { MessageEmbed, Message } from 'discord.js';
import search from '@pepper/modules/fgo/servant-name-search';
import sentence from '@pepper/lib/sentence';
import { FgoCommand } from './baseCommand';
import main from '@pepper/modules/fgo/servant-main-database';

const commandName = 'servant-skills';
const aliases = ['servant-skills', 'sk', 'sks', 'ssks', 'skills', 'skill'];

export = class extends FgoCommand {
    constructor() {
        super(commandName, {
            aliases,
            args:  [{
                id: 'query',
                match: 'rest',
                description: 'Search query',
                type: 'string'
            }],
            typing: true,
            description: "Show a servant's skills."
        })
    }

    async exec (m: Message, { query } : { query: string; }) {
        const bail = () => m.channel.send(
            new MessageEmbed().setDescription(':frowning: Sorry, but I could not find anything matching.')
        );

        if (!query) return bail();

        let _id = +query;
        if (isNaN(_id)) {
            let res = await this.client.moduleHandler.findInstance(search)
                .search(query);
            if (!res.length) return bail();
            _id = res[0].item.id;
        }

        const _main = this.client.moduleHandler.findInstance(main);
        const results = await _main.query({ id: _id })
            .select('name id activeSkill').exec();

        if (!results.length) return bail();

        const [{ id, name, activeSkill }] = results

        let embed = new MessageEmbed().setTimestamp()
            .setAuthor(`${id}. ${name}`)
            .setTitle('Active skills')
        
        activeSkill.forEach((skillArray, i) => {
            if (i) embed = embed.addField('\u200b', '\u200b')
            skillArray.forEach(({ name, rank, detail, condition, records, cooldown }) => {
                embed = embed.addField(
                    `**${name}** __[${rank}]__ (${
                        [...new Set(cooldown)].sort((a,b)=>(+b) - (+a)).join('-')
                    })`,
                    detail.split('\n').filter(a=>a).map(a=>`- ${a}`).join('\n') 
                    + `\n`
                    + records.map(
                        ({ effectName : n, effectStrength : s }) => n ? `**[${sentence(n)}]** : ${s.join(' / ')}` : ''
                    )
                    .filter(a => a)
                    .join('\n')
                    + `\n_(${condition})_`
                )
            })
        })

        m.channel.send(embed);
    }
}
