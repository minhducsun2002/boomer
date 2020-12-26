import { performance, PerformanceObserver } from 'perf_hooks';
import { InhibitorHandler as i } from 'discord-akairo';
import type { Collection } from 'discord.js';
import type { PepperClient } from '../Client';
// util
import { componentLog } from '@pepper/utils'
import ch from 'chalk';
import { relative } from 'path';
import type { PepperInhibitor } from '../Inhibitor';

export class InhibitorHandler extends i {
    client: PepperClient;
    clientLog = new componentLog('Inhibitors', '972f2f', 'ffffff')

    constructor(...args : ConstructorParameters<typeof i>) {
        super(...args);
        this.on(
            'load',
            m => {
                let { id, categoryID,  filepath, handler: { directory } } = m;
                this.clientLog.success(
                    `${ch.bgYellowBright.black(`[${categoryID}]`)} `
                    + ch.blueBright(`./${relative(directory, filepath)}`)
                    + ` -> ${ch.yellowBright(`${id}`)}`
                );
            }
        )
    }

    loadAll(...args : Parameters<i['loadAll']>) {
        this.clientLog.info(
            `Loading inhibitors from ${ch.blueBright(this.directory)}...`
        )
        new PerformanceObserver((l, o) => {
            this.clientLog.success(`Loaded ${
                ch.yellowBright(this.modules.size)
            } inhibitors in ${
                ch.green(l.getEntries()[0].duration / 1000)
            }s.`);
            o.disconnect();
        }).observe({ entryTypes: ['function'] });
        performance.timerify(() => super.loadAll(...args))();
        return this;
    }

    modules: Collection<string, PepperInhibitor>;
}