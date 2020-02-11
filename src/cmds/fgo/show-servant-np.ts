import { Command } from 'discord-akairo';
import { RichEmbed, Message } from 'discord.js';

import { constructQuery, SearchParameters } from '../../lib/search';
import { ERROR_COLOR, SUCCESS_COLOR } from '../../constants/colors';
import plural from '../../lib/plural';
import sentence from '../../lib/sentence';

const commandName = 'servant-np';
const aliases = ['servant-np', 'np', 'snp'];

interface commandArgument { query?: String; _class?: String[]; }

export = class extends Command {
    constructor() {
        super(commandName, {
            aliases,
            args: [{
                id: 'query',
                match: 'rest',
                description: 'Search query'
            },{
                id: '_class',
                match: 'option',
                description: 'Filtering by class',
                flag: ['-c', '-c=', '/c:', '--class=', '/class:'],
                multipleFlags: true
            }],
            typing: true
        })
    }

    async exec(msg: Message, { query, _class } : commandArgument) {
        const wait = new RichEmbed().setDescription(':hourglass: Querying database...')
        const errEmbed = new RichEmbed().setColor(ERROR_COLOR);
        const out = await msg.channel.send(wait) as Message;

        if (!query) return out.edit('', errEmbed.setDescription(':frowning: Where is your query?'));

        const q = Number.isInteger(+query) 
            ? { id: +query } as SearchParameters
            : { np: query, name: query, class: _class } as SearchParameters
        const results = await constructQuery(q, 1)
            .select('name noblePhantasm id dmgDistribution.np').exec();

        if (!results.length) return out.edit(
            '', 
            errEmbed.setDescription(':frowning: Sorry, but I could not find anything matching.')
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
                                return `**[${sentence(effectName)}]** : ${effectStrength.join(' / ')}`
                            else return ''
                        }
                    ).filter(a=>!!a).join('\n')}`
                    + `\n__${overchargeRecords.map(
                        ({ effectName, effectStrength }) => {
                            if (effectStrength.length)
                                return `**[${sentence(effectName)}]** : ${effectStrength.join(' / ')}`
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