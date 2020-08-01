import { MessageEmbed, Message } from 'discord.js';
import { constructQuery, SearchParameters } from '../../lib/fgo/search';
import { constructQuery as c,
    embedServantBase, embedServantDashboard,
    embedTreasureDeviceBase, renderPassiveSkill
} from '@pepper/lib/fgo';
import { NA } from '@pepper/db/fgo';
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
                id: 'class',
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
        { query, class : _class, allTrait }: { query?: string; class: string, allTrait: boolean }
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


        const [{ id, activeSkill }] = results;

        const [svt] = await c.mstSvt({ collectionNo: +id }).NA.exec();
        let { baseSvtId, classId, classPassive } = svt;
        const [mstSvtLimits, cards, { [0]: __class }] = await Promise.all([
            await c.mstSvtLimit({ svtId: baseSvtId }).NA.limit(5).exec(),
            await c.mstSvtCard({ svtId: baseSvtId }).NA.limit(4).exec(),
            await c.mstClass({ id: classId }).NA.exec()
        ]);
        // render NP gain
        const svtTdMapping = await NA.mstSvtTreasureDevice.find({ svtId: baseSvtId, num: 1 }).exec();
        let [{ treasureDeviceId: tdId }] = svtTdMapping;
        const [td_npGain] = await c.mstTreasureDeviceLv({ treaureDeviceId: tdId }).NA.exec();
        const td = (await Promise.all(
            svtTdMapping.map(
                a => NA.mstTreasureDevice.findOne({ id: a.treasureDeviceId }).exec()
            )
        )).sort((a, b) => a.id - b.id);

        let base = () => embedServantBase(svt, __class, mstSvtLimits)
            .setURL(`https://apps.atlasacademy.io/db/#/NA/servant/${id}`)

        let tdEmbed = (await Promise.all(
            td.map(td => embedTreasureDeviceBase(td))
        )).map((a, i) => 
            base()
                .addFields(a)
                .setDescription(
                    `[__${td[i].rank}__] `
                    + `[**${td[i].name}** [**__${td[i].typeText}__**]](${
                        `https://apps.atlasacademy.io/db/#/NA/noble-phantasm/${td[i].id}`
                    })`
                )
                .setFooter(`Noble Phantasm`)
        )

        let passives = await Promise.all(classPassive.map(_ => renderPassiveSkill(_)));

        paginatedEmbed()
            .setChannel(m.channel)
            .setEmbeds(
                [
                    (await embedServantDashboard(svt, __class, mstSvtLimits, cards, td_npGain, allTrait))
                        .setURL(`https://apps.atlasacademy.io/db/#/NA/servant/${id}`)
                        .setFooter(`Basic details`),
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
                    .setFooter(`Active skills`),
                    base().addFields(passives).setFooter(`Passive skills`),
                    ...tdEmbed
                ]
                .map((a, i, _) => a.setFooter(`${
                    a.footer?.text ? `${a.footer.text} • ` : ''
                }Page ${++i}/${_.length}`))
            )
            .run({ idle: 20000, dispose: true })
    }
}
