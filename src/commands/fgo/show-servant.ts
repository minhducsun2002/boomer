import { MessageEmbed, Message } from 'discord.js';
import { FgoCommand } from './baseCommand';
import { paginatedEmbed } from '@pepper/utils'
import { ERROR_COLOR } from '@pepper/constants/colors';
import search from '@pepper/modules/fgo/servant-name-search';
import cache from '@pepper/modules/fgo/servant-details-preprocess';

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
            }],
            typing: true,
            description: 'Show a servant\'s details.',
            cooldown: 1500
        })
    }

    async exec(m: Message,
        { query }: { query?: string }
    ) {
        const err = new MessageEmbed().setColor(ERROR_COLOR);

        if (!query)
            return m.channel.send(
                err.setDescription(':frowning: Where is your query?')
            )

        let search_instance = this.client.moduleHandler.findInstance(search);
        let cache_details = this.client.moduleHandler.findInstance(cache);

        let bail = () => m.channel.send(
            err.setDescription(':disappointed: Sorry, I could not find anything.')
        )

        let _id : number, det = false;
        if (Number.isInteger(+query)) {
            _id = +query;
            det = true;
        }
        else {
            // check for tokenization matches
            let ids = search_instance.tokenSearch(query);
            let res = await search_instance.search(query);
            if (ids && ids.size)
                res = res.filter(_ => ids.has(_.item.id));
            if (!res.length) return bail();
            _id = res[0].item.id;
        }

        let e : MessageEmbed[] = [];

        // try {
            let cached = await cache_details.get(_id) as any[];
            cached.forEach(s => e.push(new MessageEmbed(s)));
        // } catch {
        //     const results = await constructQuery({ id: _id }).limit(1).exec();
        //     if (!results.length) return bail();
        //     const [{ id, activeSkill }] = results;

        //     const [svt] = await c.mstSvt({ collectionNo: +id }).NA.exec();
        //     let { baseSvtId, classId, classPassive } = svt;
        //     const [mstSvtLimits, cards, { [0]: __class }] = await Promise.all([
        //         await c.mstSvtLimit({ svtId: baseSvtId }).NA.limit(5).exec(),
        //         await c.mstSvtCard({ svtId: baseSvtId }).NA.limit(4).exec(),
        //         await c.mstClass({ id: classId }).NA.exec()
        //     ]);
        //     // render NP gain
        //     const svtTdMapping = await NA.mstSvtTreasureDevice.find({ svtId: baseSvtId, num: 1 }).exec();
        //     let [{ treasureDeviceId: tdId }] = svtTdMapping;
        //     const [td_npGain] = await c.mstTreasureDeviceLv({ treaureDeviceId: tdId }).NA.exec();
        //     const td = (await Promise.all(
        //         svtTdMapping.map(
        //             a => NA.mstTreasureDevice.findOne({ id: a.treasureDeviceId }).exec()
        //         )
        //     )).sort((a, b) => a.id - b.id);

        //     let base = () => embedServantBase(svt, __class, mstSvtLimits);

        //     let tdEmbed = (await Promise.all(
        //         td.map(td => embedTreasureDeviceBase(td))
        //     )).map((a, i) => 
        //         base()
        //             .addFields(a)
        //             .setDescription(
        //                 `[__${td[i].rank}__] `
        //                 + `[**${td[i].name}** [**__${td[i].typeText}__**]](${
        //                     `https://apps.atlasacademy.io/db/#/NA/noble-phantasm/${td[i].id}`
        //                 })`
        //             )
        //             .setFooter(`Noble Phantasm`)
        //     )

        //     let passives = await Promise.all(classPassive.map(_ => renderPassiveSkill(_)));
        //     e = [
        //         base()
        //             .addFields(
        //                 await embedServantDashboard(svt, mstSvtLimits, cards, td_npGain, allTrait)
        //             )
        //             .setFooter(`Basic details`),
        //         base()
        //         .addField(
        //             'Active skill',
        //             activeSkill.map(a => {
        //                 const upgrades = a.length, { name, rank, detail, condition } = a.pop();
        //                 return (
        //                     `**${name}** __[${rank}]__` + (upgrades > 1 ? ` (${upgrades} upgrades)` : '')
        //                     + `\n${detail}`
        //                     + `\n_${condition}_`
        //                 )
        //             }).join('\n\n')
        //         )
        //         .setFooter(`Active skills`),
        //         base().addFields(passives).setFooter(`Passive skills`),
        //         ...tdEmbed
        //     ]
        //     .map((a, i, _) => a.setFooter(`${
        //         a.footer?.text ? `${a.footer.text} • ` : ''
        //     }Page ${++i}/${_.length}`));

        //     cache_details.push(_id, e.map(e => e.toJSON()));
        // };

        let notice = det ? '' : (
            `Search may not bring up the expected result.`
            + `\nPlease use \`${
                this.handler.findCommand(`ss`)
                    .aliases.sort((a, b) => a.length - b.length)[0]
            }\` command first to search, then call this command again with servant ID.`
        );

        paginatedEmbed()
            .setChannel(m.channel)
            .setEmbeds(e)
            .run({ idle: 20000, dispose: true }, notice)
    }
}
