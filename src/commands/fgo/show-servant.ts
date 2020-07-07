import { MessageEmbed, Message } from 'discord.js';
import { constructQuery, SearchParameters } from '../../lib/fgo/search';
import { constructQuery as c, embedServantBase, embedServantDashboard } from '@pepper/lib/fgo';
import { plural as p } from '@pepper/utils';
import { FgoCommand } from './baseCommand';
import { paginatedEmbed } from '@pepper/utils'
import { ERROR_COLOR } from '@pepper/constants/colors';

const commandName = 'servant-info';
const aliases = ['servant', 'servant-info', 's'];

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


        const [{ id,
            noblePhantasm: { length: npUpgradesCount }, activeSkill, passiveSkill
        }] = results;

        const [svt] = await c.mstSvt({ collectionNo: id as number }).NA.exec();
        let { baseSvtId, classId } = svt;
        const [mstSvtLimits, cards, { [0]: __class }] = await Promise.all([
            await c.mstSvtLimit({ svtId: baseSvtId }).NA.limit(5).exec(),
            await c.mstSvtCard({ svtId: baseSvtId }).NA.limit(4).exec(),
            await c.mstClass({ id: classId }).NA.exec()
        ]);
        const [{ treasureDeviceId: tdId }] = await c.mstSvtTreasureDevice({ svtId: baseSvtId, num: 1 }).NA.exec();
        const [td] = await c.mstTreasureDeviceLv({ treaureDeviceId: tdId }).NA.exec()

        let { name: npName, extendedName: npExtName, 
            rank: npRank, detail: npDetail, overchargeDetail: npOverDetail,
            condition: npCondition, class: npClass
        } = results[0].noblePhantasm.pop();

        let base = () => embedServantBase(svt, __class, mstSvtLimits)

        paginatedEmbed()
            .setChannel(m.channel)
            .setEmbeds(
                [
                    embedServantDashboard(svt, __class, mstSvtLimits, cards, td, allTrait),
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
