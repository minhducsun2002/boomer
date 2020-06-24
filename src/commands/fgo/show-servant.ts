import { MessageEmbed, Message } from 'discord.js';
import { Attribute, Gender } from '../../constants/fgo/strings';
import { CardType as Card } from '../../constants/fgo'
import { constructQuery, SearchParameters } from '../../lib/fgo/search';
import { constructQuery as c } from '../../lib/fgo/';
import sentence from '../../lib/sentence';
import plural from '../../lib/plural';
import { FgoCommand } from './baseCommand';

import { ERROR_COLOR, SUCCESS_COLOR } from '../../constants/colors'

const commandName = 'servant-info';
const aliases = ['servant', 'servant-info', 's'];

const maxLevel = [59, 64, 69, 79, 89];

interface commandArguments { query?: string; _class: string }

export = class extends FgoCommand {
    constructor() {
        super(commandName, {
            aliases,
            args: [{
                id: 'query',
                match: 'rest',
                description: 'Search query. Can be a servant ID.',
                type: 'string'
            }, {
                id: '_class',
                match: 'option',
                description: 'Filtering by class',
                flag: ['-c', '-c=', '/c:', '--class=', '/class:']
            }],
            typing: true,
            description: 'Show a servant\'s details.',
            cooldown: 1500
        })
    }

    async exec(msg: Message, { query, _class }: commandArguments) {
        const wait = new MessageEmbed().setDescription(':hourglass: Querying database...')
        const err = new MessageEmbed().setColor(ERROR_COLOR);
        const out = await msg.channel.send(wait) as Message;

        if (!query && !_class) return out.edit('',err.setDescription(':frowning: Where is your query?'))

        const q = Number.isInteger(+query)
            ? { id: +query }
            : { name: query, class: [_class].filter(Boolean) } as SearchParameters

        const results = await constructQuery(q).exec();
        if (!results.length) 
            return out.edit('', err.setDescription(':disappointed: Sorry, I could not find anything.'))


        const [{ rarity, id, stats: { hp, atk }, npGainStat: [npPerATK, npPerHit],
            criticalStat: [starAbsorption], traits, alignment, 
            noblePhantasm: { length: npUpgradesCount }, activeSkill, passiveSkill
        }] = results;

        const [{
            name, baseSvtId, classId, attri, genderType, cardIds,
            starRate: starGen, collectionNo, relateQuestIds
        }] = await c.mstSvt({ collectionNo: id as number }).NA.exec()
        const [{ name: className }] = await c.mstClass({ id: classId }).NA.exec()
        const dmg = (await c.mstSvtCard({ svtId: baseSvtId }).NA.limit(4).exec())
            .sort((a, b) => a.cardId - b.cardId)
            .map(a => a.normalDamage)

        let { name: npName, extendedName: npExtName, 
            rank: npRank, detail: npDetail, overchargeDetail: npOverDetail,
            condition: npCondition, class: npClass
        } = results[0].noblePhantasm.pop();



        const resultEmbed = new MessageEmbed()
            .setColor(SUCCESS_COLOR)
            .setAuthor(`${rarity}☆ ${className}`)
            .setTitle(`${collectionNo}. **${name}** (\`${baseSvtId}\`)`)
            .addField(
                'HP/ATK',
                `- Base : ${hp[0]}/${atk[0]}`
                + `\n- Maximum : ${hp[maxLevel[+rarity - 1]]}/${atk[maxLevel[+rarity - 1]]}`
                + `\n- Maximum (grailed) : ${hp.pop()}/${atk.pop()}`,
                true
            )
            .addField(
                'Cards / Damage distribution by %',
                // -1 due to array from 0
                `- Buster : ${cardIds.reduce((b, a) => a === Card.BUSTER ? b + 1 : b, 0)} / ${dmg[Card.BUSTER - 1].join('-')}`
                + `\n- Arts : ${cardIds.reduce((b, a) => a === Card.ARTS ? b + 1 : b, 0)} / ${dmg[Card.ARTS - 1].join('-')}`
                + `\n- Quick : ${cardIds.reduce((b, a) => a === Card.QUICK ? b + 1 : b, 0)} / ${dmg[Card.QUICK - 1].join('-')}`
                + `\n- Extra : 1 / ${dmg[Card.EXTRA - 1].join('-')}`,
                true
            )
            .addField('\u200b', '\u200b')
            .addField('NP generation', `- Per hit : ${npPerATK}\n- When attacked : ${npPerHit}`, true)
            .addField('Critical stars', `- Star weighting : ${starAbsorption}\n- Star generation : ${(starGen / 10).toFixed(1)}%`, true)
            .addField('\u200b', '\u200b')
            .addField('Traits', traits.join(', '), true)
            .addField(
                'Gender / Attribute / Alignment', 
                `${Gender[genderType].join(' + ')} / ${Attribute[attri]} / ${
                    alignment.split(' ').map(a=>sentence(a)).join(' ')
                }`,
                true
            ).addField(
                'Related quests (ID)',
                relateQuestIds.map(a => `\`${a}\``).join(', ') || 'None',
                true
            )
            .addField('\u200b', '\u200b')
            .addField(
                'Active skill',
                activeSkill.map(a => {
                    const upgrades = a.length, { name, rank, detail, condition } = a.pop();
                    return (
                        `**${name}** __[${rank}]__` + (upgrades > 1 ? ` (${upgrades} upgrades)` : '')
                        + `\n${detail}`
                        + `\n_${condition}_`
                    )
                }).join('\n\n')
            )
            .addField(
                'Passive skill',
                passiveSkill.map(({ name, detail, rank }) => `**${name}** [__${rank}__]\n${detail}`).join('\n\n')
            )
            .addField('\u200b', '\u200b')
            .addField(
                'Noble Phantasm ' + (npUpgradesCount > 1 ? `(${npUpgradesCount} upgrade${plural(npUpgradesCount)})` : ''),
                `**${npName}** __${npRank}__ (${npClass})`
                + (npExtName ? `\n_${npExtName}_` : '')
                + `\n\n- ${npDetail.split('\n').filter(a=>!!a).join('\n- ')}`
                + `\n- ${npOverDetail.split('\n').filter(a=>!!a).map(a=>`__${a}__`).join('\n- ')}`
                + (npCondition ? `\n_${npCondition}_` : '')
            )

        await out.edit('', resultEmbed)
    }
}
