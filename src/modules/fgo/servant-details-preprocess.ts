import { FgoModule } from './base';
import { componentLog } from '@pepper/utils';
import m, { Servant } from './servant-main-database';
import { JP as jp, NA as na, DBInstance } from '@pepper/db/fgo';
import { decode, encode } from '@msgpack/msgpack'
import { embedServantBase, embedServantDashboard, embedTreasureDeviceBase, renderPassiveSkill } from '@pepper/lib/fgo'
import { Collection, MessageEmbed } from 'discord.js';
import { Queue } from 'queue-ts';
import { cpus } from 'os';

export = class extends FgoModule {
    constructor() {
        super(`servant-details-preprocess`, {});
    }

    cache = new Collection<number, Buffer>();
    private log = new componentLog(`F/GO servant details`);

    push(s: number, d: any) {
        let b = encode(d);
        this.cache.set(s, Buffer.from(b.buffer, b.byteOffset, b.byteLength));
        this.log.success(`Saved details for servant ${s}.`);
        return this;
    }

    async get(s: number) {
        if (!this.cache.has(s)) {
            // try to get this from DB & parse it
            try {
                let _ = await this.handler.findInstance(m).get(s);
                if (!_) throw new Error(`Servant with ID ${s} not found!`)
                this.push(_.id, await this.process(_));
                return decode(this.cache.get(s)) as MessageEmbed[];
            } catch (e) {
                this.log.error(`Key ${s} is not found in cache & re-render failed!`);
                this.log.error(e);
            }
        }
        return decode(this.cache.get(s)) as MessageEmbed[];
    }

    clean() {
        let _ = this.cache.size;
        this.cache.clear();
        this.log.info(`Cleared ${_} entries from cache.`);
        return _;
    }

    private async process(dataset : Servant, NA : DBInstance = na, JP : DBInstance = jp) {
        const { name, id, activeSkill } = dataset;

        const svt = await JP.mstSvt.findOne({ collectionNo: +id }).exec();
        let { baseSvtId, classId, classPassive } = svt;
        const [mstSvtLimits, cards, { [0]: __class }] = await Promise.all([
            await JP.mstSvtLimit.find({ svtId: baseSvtId }).limit(5).exec(),
            await JP.mstSvtCard.find({ svtId: baseSvtId }).limit(4).exec(),
            await NA.mstClass.find({ id: classId }).exec()
        ]);
        // render NP gain
        const svtTdMapping = await JP.mstSvtTreasureDevice.find({ svtId: baseSvtId, num: 1 }).exec();
        let [{ treasureDeviceId: tdId }] = svtTdMapping;
        const td_npGain = await JP.mstTreasureDeviceLv.findOne({ treaureDeviceId: tdId }).exec();
        const td = (await Promise.all(
            svtTdMapping.map(
                a => JP.mstTreasureDevice.findOne({ id: a.treasureDeviceId }).exec()
            )
        )).sort((a, b) => a.id - b.id);

        // overwrite name
        svt.name = name;
        let base = () => embedServantBase(svt, __class, mstSvtLimits);

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
        return [
            base()
                .addFields(
                    await embedServantDashboard(svt, mstSvtLimits, cards, td_npGain, true)
                )
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
        }Page ${++i}/${_.length}`));
    }

    async initialize() {
        let _m = this.handler.findInstance(m);
        let _ = await _m.ids();
        // delegate this to another function to run in parallel
        let queue = new Queue(cpus().length);

        for (let { id } of _) {
            queue.add(
                () => _m.get(id)
                    .then(s => this.process(s))
                    .then(e => e.map(e => e.toJSON()))
                    .then(o => this.push(id, o))
                    .catch(e => this.log.error(`Error processing servant ${id}.\n${
                        `${e.name} : ${e.message}\n${e.stack}`
                    }`))  
            )
        };
    }
}