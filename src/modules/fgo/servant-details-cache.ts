import { Collection } from 'discord.js';
import { FgoModule } from './base';
import { componentLog } from '@pepper/utils';
import { Buffer } from 'buffer';
import { decode, encode } from '@msgpack/msgpack'

export = class extends FgoModule {
    constructor() {
        super(`servant-details-cache`, {});
    }

    private log = new componentLog(`F/GO servant details cache`);
    private cache = new Collection<number, Buffer>();

    push(s: number, d: any) {
        let b = encode(d);
        this.cache.set(s, Buffer.from(b.buffer, b.byteOffset, b.byteLength));
        this.log.success(`Saved details for servant collection number ${s}.`);
        return this;
    }

    get(s: number) {
        if (!this.cache.has(s))
            throw new Error(`Key ${s} is not found in cache!`);
        return decode(this.cache.get(s));
    }

    clean() {
        let _ = this.cache.size;
        this.cache.clear();
        this.log.info(`Cleared ${_} entries from cache.`)
    }

    initialized = false;
    async initialize() {
        // TODO : preprocess details
        this.initialized = true;
    }
}