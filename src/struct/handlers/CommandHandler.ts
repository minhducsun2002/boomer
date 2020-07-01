import type { Collection } from 'discord.js';
import { CommandHandler as c } from 'discord-akairo';
import type { PepperClient } from '../Client';
import type { PepperCommand } from '../Command';
import { NOT_INITIALIZED } from '../Command';
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
                Promise.resolve((m as PepperCommand).initialize())
                    .then(
                        m => (m === NOT_INITIALIZED)
                        ? 0 : this.clientLog.success(`Initialized command ${id}.`)
                    )
            }
        )
    }

    loadAll(...args : Parameters<_c['loadAll']>) {
        this.clientLog.info(
            `Loading commands from ${ch.blueBright(this.directory)}...`
        )
        let _ = super.loadAll(...args);
        this.clientLog.success(`Loaded ${this.modules.size} commands.`)
        return _;
    }

    modules: Collection<string, PepperCommand>;
    findCommand: (name: string) => PepperCommand;
}