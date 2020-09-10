import { MessageEmbed, Message } from 'discord.js';
import { plural as p } from '@pepper/utils' ;
import sentence from '@pepper/lib/sentence';
import { FgoCommand } from './baseCommand';
import search from '@pepper/modules/fgo/servant-name-search';
import main from '@pepper/modules/fgo/servant-main-database';

const commandName = 'servant-np';
const aliases = ['servant-np', 'np', 'snp'];

export = class extends FgoCommand {
    constructor() {
        super(commandName, {
            aliases,
            args: [{
                id: 'query',
                match: 'rest',
                description: 'Search query'
            }],
            typing: true,
            description: "Show a servant's Noble Phantasm."
        })
    }

    async exec(m: Message, { query } : { query: string }) {
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
            .select('name noblePhantasm id dmgDistribution.np').exec();

        if (!results.length) return bail();

        const [{ name, id, noblePhantasm: np }] = results;

        const embed = new MessageEmbed()
            .setAuthor(`${id}. ${name}`)
            .setTitle(`Noble Phantasm${p(np.length)}`)

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

        m.channel.send(embed);
    }
}
