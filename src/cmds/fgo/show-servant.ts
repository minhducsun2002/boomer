import { MessageEmbed, Message } from 'discord.js';
import { Attribute, Gender } from '../../constants/fgo/strings'
import { constructQuery, SearchParameters } from '../../lib/fgo/search';
import { constructQuery as mstSvtConstructQuery } from '../../lib/fgo/mstSvt';
import { constructQuery as mstClassConstructQuery } from '../../lib/fgo/mstClass';
import sentence from '../../lib/sentence';
import plural from '../../lib/plural';
import { FgoCommand } from './baseCommand';

import { ERROR_COLOR, SUCCESS_COLOR } from '../../constants/colors'

const commandName = 'servant-info';
const aliases = ['servant', 'servant-info', 's'];

const maxLevel = [59, 64, 69, 79, 89];

interface commandArguments { query?: String; img?: Number; _class?: String; }

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
                id: 'img',
                match: 'option',
                flag: ['-i', '-i=', '/i:', '--image=', '/image:'],
                description: 'Toggle whether an art is shown (a non-zero value shows), and which stage to show.',
                type: 'integer',
                default: 0
            }, {
                id: '_class',
                match: 'option',
                description: 'Filtering by class',
                flag: ['-c', '-c=', '/c:', '--class=', '/class:']
            }],
            typing: true,
            description: 'Show a servant\'s details.'
        })
    }

    async exec(msg: Message, { query, img, _class }: commandArguments) {
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


        const [{ rarity, id, stats: { hp, atk }, npGainStat: [npPerATK, npPerHit], arts,
            cardSet: { buster: _cardBuster, quick: _cardQuick, arts: _cardArts },
            dmgDistribution: { buster: _dmgBuster, quick: _dmgQuick, arts: _dmgArts, extra: _dmgExtra },
            criticalStat: [starAbsorption], traits, alignment, growth,
            noblePhantasm: { length: npUpgradesCount }, activeSkill, alias: _alias, passiveSkill
        }] = results;

        const [{
            name, baseSvtId, classId, attri, genderType,
            starRate: starGen, collectionNo
        }] = await mstSvtConstructQuery({ collectionNo: id as number }).NA.exec()
        const [{ name: className }] = await mstClassConstructQuery({ id: classId }).NA.exec()

        let { name: npName, extendedName: npExtName, 
            rank: npRank, detail: npDetail, overchargeDetail: npOverDetail,
            condition: npCondition, class: npClass
        } = results[0].noblePhantasm.pop()

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
                `- Buster : ${_cardBuster} / ${_dmgBuster.join('-')}`
                + `\n- Arts : ${_cardArts} / ${_dmgArts.join('-')}`
                + `\n- Quick : ${_cardQuick} / ${_dmgQuick.join('-')}`
                + `\n- Extra : 1 / ${_dmgExtra.join('-')}`,
                true
            )
            .addBlankField()
            .addField('NP generation', `- Per hit : ${npPerATK}\n- When attacked : ${npPerHit}`, true)
            .addField('Critical stars', `- Star weighting : ${starAbsorption}\n- Star generation : ${(starGen / 10).toFixed(1)}%`, true)
            .addField('Growth', growth, true)
            .addBlankField()
            .addField('Traits', traits.join(', '), true)
            .addField(
                'Gender / Attribute / Alignment', 
                `${Gender[genderType].join(' + ')} / ${Attribute[attri]} / ${
                    alignment.split(' ').map(a=>sentence(a)).join(' ')
                }`,
                true
            ).addField(
                'Aliases',
                _alias.filter(a=>a!==name).join(', ') || '(none)',
                true
            )
            .addBlankField()
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
            .addBlankField()
            .addField(
                'Noble Phantasm ' + (npUpgradesCount > 1 ? `(${npUpgradesCount} upgrade${plural(npUpgradesCount)})` : ''),
                `**${npName}** __${npRank}__ (${npClass})`
                + (npExtName ? `\n_${npExtName}_` : '')
                + `\n\n- ${npDetail.split('\n').filter(a=>!!a).join('\n- ')}`
                + `\n- ${npOverDetail.split('\n').filter(a=>!!a).map(a=>`__${a}__`).join('\n- ')}`
                + (npCondition ? `\n_${npCondition}_` : '')
            )

        if (img && img > 0 && img < 5) resultEmbed.setImage(arts[(+img) - 1].toString());

        await out.edit('', resultEmbed)
    }
}
