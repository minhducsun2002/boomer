import { FgoModule } from './base';
import { componentLog } from '@pepper/utils';
import mst from './master-data';
import comp from './complementary-data';
import { decode, encode } from '@msgpack/msgpack'
import { EmbedRenderer } from '@pepper/lib/fgo'
import { Collection, MessageEmbed } from 'discord.js';

export = class extends FgoModule {
    require = [new mst().id];
    constructor() {
        super(`ce-details-cache`, {});
    }

    cache = new Collection<number, Uint8Array>();
    private log = new componentLog(`F/GO CE details`);

    push(s: number, d: any) {
        let b = encode(d);
        this.cache.set(s, b);
        return this;
    }

    async get(s: number) {
        if (!this.cache.has(s)) {
            // try to get this from DB & parse it
            try {
                // let _ = await this.handler.findInstance(m).get(s);
                // if (!_) throw new Error(`CE with ID ${s} not found!`)
                this.push(s, await this.process(s));
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
}