import { FgoModule } from './base';
import { componentLog } from '@pepper/utils';
import mst from './master-data';
import comp from './complementary-data';
import { decode, encode } from '@msgpack/msgpack'
import { EmbedRenderer } from '@pepper/lib/fgo'
import { Collection, MessageEmbed } from 'discord.js';
import { Queue } from 'queue-ts';
import { cpus } from 'os';
import c from 'chalk';
import { SvtType } from '@pepper/constants/fgo';

export = class extends FgoModule {
    require = [new mst().id];
    constructor() {
        super(`servant-details-preprocess`, {});
    }

    cache = new Collection<number, Buffer>();
    private log = new componentLog(`F/GO servant details`);

    push(s: number, d: any) {
        let b = encode(d);
        this.cache.set(s, Buffer.from(b.buffer, b.byteOffset, b.byteLength));
        return this;
    }

    async get(s: number) {
        if (!this.cache.has(s)) {
            // try to get this from DB & parse it
            try {
                let _ = await this.handler.findInstance(mst).JP.mstSvt.findOne({ collectionNo: s }).exec();
                let name = await this.getLocalizedSvtName(_.baseSvtId) ?? _.name;
                if (!_) throw new Error(`Servant with ID ${s} not found!`)
                this.push(_.collectionNo, await this.process(name, _.collectionNo));
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
        return _;
    }

    private getLocalizedSvtName = (baseSvtId: number) => this.client.moduleHandler.findInstance(comp)
            .svtObject.findOne({ id: baseSvtId }).exec().then(obj => obj?.name)

    private process = (name: string, collectionNo: number) => {
        let { NA, JP } = this.client.moduleHandler.findInstance(mst);
        let _comp = this.client.moduleHandler.findInstance(comp);
        return new EmbedRenderer(NA, JP, _comp).servantDashboardEmbed(name, collectionNo);
    }

    async initialize() {
        let _mst = this.handler.findInstance(mst);
        let _ = await _mst.JP.mstSvt.find({
            $or: [
                { type: SvtType.NORMAL },
                { type: SvtType.HEROINE },
                { type: SvtType.ENEMY_COLLECTION_DETAIL }
            ]
        }).select('collectionNo name baseSvtId').exec();
        // delegate this to another function to run in parallel
        let queue = new Queue(cpus().length * 2);

        for (let { collectionNo, name, baseSvtId } of _) {
            if (collectionNo)
            queue.add(
                async () => {
                    try {
                        name = await this.getLocalizedSvtName(baseSvtId) ?? name;
                        let e = (await this.process(name, collectionNo)).map(e => e.toJSON());
                        this.log.success(`Processed data of servant ${collectionNo}. ${
                            c.bgBlue.yellowBright(name)
                        }`);
                        this.push(collectionNo, e);
                    } catch (e) {
                        this.log.error(`Error processing servant ${collectionNo}.\n${e.stack}`)
                    };
                }  
            )
        };
    }
}