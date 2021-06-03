import { componentLog } from '@pepper/utils';
import { OsuModule } from './base';
import Cache from '@akashbabu/lfu-cache';
import { URL } from 'url';
import axios from 'axios';

export = class extends OsuModule {
    constructor() {
        super('map-cache')
    }

    private cache = new Cache<{ map: number, time: number }>({ maxAge: 86400 * 1000, evictCount: 5, max: 50000 });
    private log = new componentLog('osu! map ID cache');
    private syncEnabled = true;
    private interval : ReturnType<typeof setInterval>;

    getChannelMapId = (channelId : string) : number => this.cache.get(channelId)?.map;
    setChannelMapId = (channelId : string, map : number) => {
        this.log.info(`Setting latest map ID of channel ID ${channelId} to ${map}.`)
        this.cache.delete(channelId);
        this.cache.set(channelId, {
            time: new Date().getTime(),
            map,
        });
    }

    async initialize() {
        const host = process.env.KV_STORE_HOST;
        if (!host) return this.log.error(`Host for storing cache between restarts are not set. Cache sync will be disabled.`)
        const url = new URL(`/osu-map-cache`, `https://${host}`);

        let _ = await axios.get(url.href, { responseType: 'text', transformResponse: [_ => _] }).then(_ => _.data as string);

        if (_)
        for (let entry of JSON.parse(_) as { map: number, channelId: string, time: number }[])
            if (new Date().getTime() - entry.time < 82800 * 1000)
                // 23h
                this.cache.set(entry.channelId, {
                    map: entry.map,
                    time: new Date().getTime()
                })

        if (this.syncEnabled) {
            this.interval = setInterval(() => {
                if (!this.syncEnabled) clearInterval(this.interval);
                let _ = this.cache.map(([channelId, payload]) => {
                    let { map, time } = payload;
                    return { channelId, map, time };
                });
                axios.post(url.href, JSON.stringify(_));
            }, 1000 * 10);
            this.log.success(`Set up interval to flush the cache to host every 10 seconds.`);
        }
    }
}