import { MessageEmbed, Message } from 'discord.js';
import { Trait } from '@pepper/constants/fgo/strings';
import {
    CardType as Card,
    AttributeModifier as attrMod,
    GenderModifier as genMod,
    ClassModifier as claMod
} from '@pepper/constants/fgo';
import { constructQuery, SearchParameters } from '../../lib/fgo/search';
import { constructQuery as c, embedServantBase } from '@pepper/lib/fgo';
import { plural as p } from '@pepper/utils';
import { FgoCommand } from './baseCommand';
import { paginatedEmbed } from '@pepper/utils'
import { ERROR_COLOR } from '@pepper/constants/colors';

const commandName = 'servant-info';
const aliases = ['servant', 'servant-info', 's'];

const maxLevel = [59, 64, 69, 79, 89];

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
            }, {
                id: 'allTrait',
                match: 'flag',
                description: 'Show non-rendered traits',
                flag: ['/a']
            }],
            typing: true,
            description: 'Show a servant\'s details.',
            cooldown: 1500
        })
    }

    async exec(m: Message,
        { query, _class, allTrait }: { query?: string; _class: string, allTrait: boolean }
    ) {
        const err = new MessageEmbed().setColor(ERROR_COLOR);

        if (!query && !_class)
            return m.channel.send(
                err.setDescription(':frowning: Where is your query?')
            )

        const q = Number.isInteger(+query)
            ? { id: +query }
            : { name: query, class: [_class].filter(Boolean) } as SearchParameters

        const results = await constructQuery(q).exec();
        if (!results.length) 
            return m.channel.send(
                err.setDescription(':disappointed: Sorry, I could not find anything.')
            )


        const [{ id, stats: { hp, atk }, npGainStat: [npPerATK, npPerHit],
            noblePhantasm: { length: npUpgradesCount }, activeSkill, passiveSkill
        }] = results;

        const [svt] = await c.mstSvt({ collectionNo: id as number }).NA.exec();
        let {
            baseSvtId, classId, attri, genderType, cardIds,
            starRate: starGen, relateQuestIds, individuality: _in
        } = svt;
        const mstSvtLimits = await c.mstSvtLimit({ svtId: baseSvtId }).NA.limit(5).exec();
        const dmg = (await c.mstSvtCard({ svtId: baseSvtId }).NA.limit(4).exec())
            .sort((a, b) => a.cardId - b.cardId)
            .map(a => a.normalDamage)

        let { name: npName, extendedName: npExtName, 
            rank: npRank, detail: npDetail, overchargeDetail: npOverDetail,
            condition: npCondition, class: npClass
        } = results[0].noblePhantasm.pop();


        let rarity = Math.max(...mstSvtLimits.map(a => a.rarity));
        let __class = (await c.mstClass({ id: classId }).NA.exec())[0];
        let base = () => embedServantBase(svt, __class, mstSvtLimits),
            ccount = (_ : Card) => 
                cardIds.reduce((b, a) => a === _ ? b + 1 : b, 0)

        let ind = new Set(_in);
            ind.delete(baseSvtId);
            ind.delete(attri + attrMod);
            ind.delete(genderType + genMod);
            ind.delete(claMod + classId);

        paginatedEmbed()
            .setChannel(m.channel)
            .setEmbeds(
                [
                    base()
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
                        `- Buster : ${ccount(Card.BUSTER)} / ${dmg[Card.BUSTER - 1].join('-')}`
                        + `\n- Arts : ${ccount(Card.ARTS)} / ${dmg[Card.ARTS - 1].join('-')}`
                        + `\n- Quick : ${ccount(Card.QUICK)} / ${dmg[Card.QUICK - 1].join('-')}`
                        + `\n- Extra : 1 / ${dmg[Card.EXTRA - 1].join('-')}`,
                        true
                    )
                    .addField('NP generation', `- Per hit : ${npPerATK}\n- When attacked : ${npPerHit}`, true)
                    .addField('Critical stars', `- Star weighting : ${
                        mstSvtLimits[0].criticalWeight
                    }\n- Star generation : ${(starGen / 10).toFixed(1)}%`, true)
                    .addField(
                        'Traits',
                        [...ind]
                            .map(a => Trait[a as keyof typeof Trait] || a)
                            // filter out not defined mappings
                            .filter(a => allTrait ? 1 : isNaN(+a))
                            .map(a => `* **${a}**`)
                            .join('\n'),
                        true
                    )
                    .addField(
                        'Gender / Attribute', 
                        `${Trait[
                            (genderType + genMod) as keyof typeof Trait
                        ]} / ${Trait[
                            (attri + attrMod) as keyof typeof Trait
                        ]}`,
                        true
                    ).addField(
                        'Related quests (ID)',
                        relateQuestIds.map(a => `\`${a}\``).join(', ') || 'None',
                        true
                    ),
                    base()
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
                    ),
                    base()
                    .addField(
                        'Noble Phantasm ' + (npUpgradesCount > 1 ? `(${npUpgradesCount} upgrade${p(npUpgradesCount)})` : ''),
                        `**${npName}** __${npRank}__ (${npClass})`
                        + (npExtName ? `\n_${npExtName}_` : '')
                        + `\n\n- ${npDetail.split('\n').filter(a=>!!a).join('\n- ')}`
                        + `\n- ${npOverDetail.split('\n').filter(a=>!!a).map(a=>`__${a}__`).join('\n- ')}`
                        + (npCondition ? `\n_${npCondition}_` : '')
                    )
                ]
                .map((a, i, _) => a.setFooter(`Page ${++i}/${_.length}`))
            )
            .run({ idle: 20000, dispose: true })
    }
}
