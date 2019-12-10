const { Command } = require('discord-akairo');
const { RichEmbed } = require('discord.js');

const { ServantModel: model } = require('../db/model');

const plural = require('../lib/plural');

const ERROR_COLOR = '#FF0000';
const INDETERMINATE_COLOR = '#FFFF00';
const SUCCESS_COLOR = '#00FF00';

const maxLevel = [59, 64, 69, 79, 89];

module.exports = class extends Command {
    constructor() {
        super('servant-info', {
            aliases: ['servant', 'servant-info', 's'],
            args : [{
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
            },{
                id: '_class',
                match: 'option',
                description: 'Filtering by class',
                flag: ['-c', '-c=', '/c:', '--class=', '/class:']
            }],
            typing: true,
            description: 'Servant details'
        });
    }

    async exec(msg, { query, img, _class }) {
        const embed = new RichEmbed().setDescription(':hourglass: Querying database...')
        const out = await msg.channel.send(embed);

        if (!query && !_class) return out.edit(
            '', 
            embed.setColor(ERROR_COLOR)
                .setDescription(':frowning: Where is your query?')
        )

        // process query here

        let results;

        if (Number.isInteger(+query)) {
            results = model.find({ id: query });
        }
        else {
            query = escape(query); _class = escape(_class);
            const stringMatch = { $regex: query, $options: "i" };
            results = model.find({ 
                $and: [{
                    $or : [
                        { name: stringMatch },
                        // search by name...
                        { 
                            alias: {
                                $elemMatch: {...stringMatch}
                            } 
                        }
                        // and by alias
                    ]
                },(_class ? { class : { $regex: _class, $options: "i" } } : {})]
            });
        }

        results = await results.limit(1).exec()

        if (!results.length) 
            return out.edit(
                '', 
                embed.setDescription(':disappointed: Sorry, I could not find anything.')
                    .setColor(ERROR_COLOR)
            )

        let [result] = results;
        await out.edit(
            '',
            embed.setDescription(`:hourglass: Found record for **${result.name}**. Please wait...`)
                .setColor(INDETERMINATE_COLOR)
        )

        const { name, rarity, class: __class, id, stats: { hp, atk }, npGainStat: [npPerATK, npPerHit], arts,
            cardSet: { buster: _cardBuster, quick: _cardQuick, arts: _cardArts },
            dmgDistribution: { buster: _dmgBuster, quick: _dmgQuick, arts: _dmgArts, extra: _dmgExtra },
            criticalStat: [starAbsorption, starGen], traits, gender, attribute, alignment, growth,
            noblePhantasm: { length: npUpgradesCount }, activeSkill
        } = result;

        let { name: npName, extendedName: npExtName, 
            rank: npRank, detail: npDetail, overchargeDetail: npOverDetail,
            condition: npCondition, class: npClass
        } = result.noblePhantasm.pop()

        const resultEmbed = new RichEmbed()
            .setColor(SUCCESS_COLOR)
            .setAuthor(`${rarity}☆ ${__class.sentence()}`)
            .setTitle(`${id}. **${name}**`)
            .addField(
                'HP/ATK',
                `- Base : ${hp[0]}/${atk[0]}`
                + `\n- Maximum : ${hp[maxLevel[rarity - 1]]}/${atk[maxLevel[rarity - 1]]}`
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
            .addField('Critical stars', `- Star weighting : ${starAbsorption}\n- Star generation : ${starGen}`, true)
            .addField('Growth', growth, true)
            .addBlankField()
            .addField('Traits', traits.join(', '), true)
            .addField(
                'Gender / Attribute / Alignment', 
                `${gender.sentence()} / ${attribute.sentence()} / ${
                    alignment.split(' ').map(a => a.sentence()).join(' ')
                }`,
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
            .addBlankField()
            .addField(
                'Noble Phantasm ' + (npUpgradesCount > 1 ? `(${npUpgradesCount} upgrade${plural(npUpgradesCount)})` : ''),
                `**${npName}** __${npRank}__ (${npClass})`
                + (npExtName ? `\n_${npExtName}_` : '')
                + `\n\n- ${npDetail.split('\n').filter(a=>!!a).join('\n- ')}`
                + `\n- ${npOverDetail.split('\n').filter(a=>!!a).map(a=>`__${a}__`).join('\n- ')}`
                + (npCondition ? `\n_${npCondition}_` : '')
            )

        if (img && img > 0 && img < 5) resultEmbed.setImage(arts[--img]);

        await out.edit('', resultEmbed)
    }
}