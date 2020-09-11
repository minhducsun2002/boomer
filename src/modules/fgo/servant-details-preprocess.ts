import { FgoModule } from './base';
import { componentLog } from '@pepper/utils';
import m from './servant-main-database';
import mst from './master-data';
import comp from './complementary-data';
import { decode, encode } from '@msgpack/msgpack'
import { EmbedRenderer } from '@pepper/lib/fgo'
import { Collection, MessageEmbed } from 'discord.js';
import { Queue } from 'queue-ts';
import { cpus } from 'os';
import c from 'chalk';

export = class extends FgoModule {
    require = [new m().id, new mst().id];
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
        return _;
    }

    

    private process = (
        servantDataset : Parameters<EmbedRenderer['createEmbeds']>[0]
    ) => {
        let { NA, JP } = this.client.moduleHandler.findInstance(mst);
        let _comp = this.client.moduleHandler.findInstance(comp);
        return new EmbedRenderer(NA, JP, _comp).createEmbeds(servantDataset);
    }

    async initialize() {
        let _m = this.handler.findInstance(m);
        let _ = await _m.ids();
        // delegate this to another function to run in parallel
        let queue = new Queue(cpus().length * 2);

        for (let { id } of _) {
            queue.add(
                async () => {
                    try {
                        let s = await _m.get(id);
                        let e = (await this.process(s)).map(e => e.toJSON());
                        this.log.success(`Processed data of servant ${id}. ${
                            c.bgBlue.yellowBright(s.name)
                        }`);
                        this.push(id, e);
                    } catch (e) {
                        this.log.error(`Error processing servant ${id}.\n${e.stack}`)
                    };
                }  
            )
        };
    }
}