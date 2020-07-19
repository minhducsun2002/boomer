import { performance, PerformanceObserver } from 'perf_hooks';
import type { Collection } from 'discord.js';
import { CommandHandler as c } from 'discord-akairo';
import type { PepperClient } from '../Client';
import type { PepperCommand } from '../Command';
// util
import { componentLog } from '@pepper/utils'
import ch from 'chalk';
import { relative } from 'path';

type _c = c;

export class CommandHandler extends c {
    client: PepperClient;
    clientLog = new componentLog('Commands', 'ff70ff', '000000')

    constructor(...args : ConstructorParameters<typeof c>) {
        super(...args);
        this.on(
            'load', 
            m => {
                let { id, categoryID, filepath, handler: { directory } } = m;
                this.clientLog.success(
                    `${ch.bgYellowBright.black(`[${categoryID}]`)} `
                    + ch.blueBright(`./${relative(directory, filepath)}`)
                    + ` -> ${ch.yellowBright(`${id}`)}`
                );
            }
        )
    }

    loadAll(...args : Parameters<_c['loadAll']>) {
        this.clientLog.info(
            `Loading commands from ${ch.blueBright(this.directory)}...`
        )
        new PerformanceObserver((l, o) => {
            this.clientLog.success(`Loaded ${
                ch.yellowBright(this.modules.size)
            } commands in ${
                ch.green(l.getEntries()[0].duration / 1000)
            }s.`);
            o.disconnect();
        }).observe({ entryTypes: ['function'] });
        performance.timerify(() => super.loadAll(...args))();
        return this;
    }

    modules: Collection<string, PepperCommand>;
    findCommand: (name: string) => PepperCommand;
}