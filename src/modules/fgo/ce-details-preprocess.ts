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
        super(`ce-details-preprocess`, {});
    }

    cache = new Collection<number, Buffer>();
    private log = new componentLog(`F/GO CE details`);

    push(s: number, d: any) {
        let b = encode(d);
        this.cache.set(s, Buffer.from(b.buffer, b.byteOffset, b.byteLength));
        return this;
    }

    async get(s: number) {
        if (!this.cache.has(s)) {
            // try to get this from DB & parse it
            try {
                // let _ = await this.handler.findInstance(m).get(s);
                // if (!_) throw new Error(`CE with ID ${s} not found!`)
                let _ = await this.process(s);
                this.push(s, _);
                return _;
            } catch (e) {
                this.log.error(`Key ${s} is not found in cache & re-render failed!`);
                this.log.error(e.stack);
            }
        }
        return decode(this.cache.get(s)) as MessageEmbed;
    }

    clean() {
        let _ = this.cache.size;
        this.cache.clear();
        return _;
    }

    

    private process = (id : number) => {
        let { NA, JP } = this.client.moduleHandler.findInstance(mst);
        let _comp = this.client.moduleHandler.findInstance(comp);
        return new EmbedRenderer(NA, JP, _comp).craftEssenceEmbed(id);
    }

    async initialize() {
        let _mst = this.handler.findInstance(mst);
        let _ = await _mst.JP.mstSvt.find({ type: SvtType.SERVANT_EQUIP }).select('id name');
        // delegate this to another function to run in parallel
        let queue = new Queue(cpus().length * 2);

        for (let { id, name } of _) {
            queue.add(
                async () => {
                    try {
                        let e = await this.process(id);
                        this.log.success(`Processed data of CE ${id}. ${
                            c.bgBlue.yellowBright(name)
                        }`);
                        this.push(id, e.toJSON());
                    } catch (e) {
                        this.log.error(`Error processing CE ${id}.\n${e.stack}`)
                    };
                }  
            )
        };
    }
}