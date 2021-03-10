import { performance, PerformanceObserver } from 'perf_hooks';
import { InhibitorHandler as i } from 'discord-akairo';
import type { Collection } from 'discord.js';
import type { PepperClient } from '../Client';
// util
import { componentLog } from '@pepper/utils'
import ch from 'chalk';
import { relative } from 'path';
import type { PepperInhibitor } from '../Inhibitor';
import Trailduck from 'trailduck';

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

    async initializeAll() {
        let k = {} as { [k: string]: { children: string[] } };
        for (let m of this.modules.keyArray()) {
            for (let i of this.modules.get(m).require)
                if (!this.modules.has(i)) {
                    this.clientLog.error(`Module ${
                        ch.yellowBright(m)
                    } depends on non-existent module ${
                        ch.yellowBright(i)
                    }`)
                    return false;
                }
            k[m] = { children: this.modules.get(m).require }
        }

        let { cycles, ordered } = new Trailduck(k);
        if (cycles?.length) {
            cycles.forEach(c => this.clientLog.error(
                `Circular dependency detected :\n`
                + c.map(i => `- ${i}`).join('\n')
            ))
            return false;
        }

        for (let i of ordered)
            await this.modules.get(i.name).initialize();
        return true;
    }

    modules: Collection<string, PepperInhibitor>;
    findInstance<Module extends typeof PepperInhibitor>(ctor : Module) {
        return this.modules.find(m => m instanceof ctor) as InstanceType<typeof ctor>;
    }
}