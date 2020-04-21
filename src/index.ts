import { config } from 'dotenv'; config();
import { AkairoClient, CommandHandler, InhibitorHandler, ArgumentType } from 'discord-akairo';
import { log, componentLog } from './lib/logger';
import { highlight } from './lib/highlight';
import { join, relative } from 'path';
import r from 'csprng';

import cfg from './config';
import plural from './lib/plural';
import './db/';

const instanceIdLength = +cfg.get('instanceIdLength') || 4;

const owner = cfg.get('owner'), p = cfg.get('prefix'), dev = process.env.NODE_ENV === 'development';
let prefixes : string[] = [];

// compute all prefixes
for (let key in p) {
    let _ : string[] = p[key];
    prefixes = prefixes.concat(..._);
}


class Bot extends AkairoClient {
    constructor() {
        super({ ownerID: Array.isArray(owner) ? owner : [owner] });
        // override logger for specific parts
        const logs = {
            command : new componentLog('Command', 'ff70ff', '000000'),
            inhibitor : new componentLog('Inhibitor', '00ffff', '000000'),
        }

        logs.command.info(`Loading commands from ${highlight.blueBright(this.cmdHandler.directory)}...`)
        logs.command.info(`Loaded ${
            this.cmdHandler
                .on(
                    'load', 
                    ({ id, categoryID, filepath, handler: { directory } }) =>
                        logs.command.success(
                            `${highlight.bgYellowBright.black(`[${categoryID}]`)} `
                            + highlight.blueBright(`./${relative(directory, filepath)}`)
                            + ` -> ${highlight.yellowBright(`${id}`)}`
                        )
                )
                .loadAll()
                .modules.size
        } commands.`);
        logs.inhibitor.success(`Loaded ${
            this.inhibitorHandler
                .on(
                    'load',
                    ({ id, filepath, handler: { directory } }) => 
                        logs.inhibitor.success(
                            highlight.blueBright(`./${relative(directory, filepath)}`)
                            + ` -> ${highlight.yellowBright(`${id}`)}`
                        )
                )
                .loadAll()
                .modules.size
        } inhibitor(s).`)

        this.cmdHandler.useInhibitorHandler(this.inhibitorHandler);
        log.success(`Setup command handler to use inhibitors from ${
            highlight.blueBright(this.inhibitorHandler.directory)
        }.`)
    }

    private _instanceId = r(256, 32).slice(0, instanceIdLength);
    locked = false;

    get instanceId() {
        return this._instanceId
    }

    set instanceId(s: string) {
        if (typeof s !== 'string') throw new Error(`Instance ID must be string, got ${typeof s}`);
        if (s.length !== instanceIdLength) throw new Error(`Instance ID must be ${instanceIdLength}, got ${s.length}`);
        this._instanceId = s;
    }

    inhibitorHandler = new InhibitorHandler(this, {
        directory: join(__dirname, 'inhibitors')
    })

    cmdHandler = new CommandHandler(this, {
        blockBots: false,
        prefix: prefixes,
        allowMention: cfg.get('pingAsPrefix') ?? true,
        directory: join(__dirname, 'commands')
    })
}

const client : Bot = new Bot();
if (dev) client.on('debug', log.info)

client.on('ready', () => {
    log.success(`Logged in as ${
        highlight.bgBlue.yellowBright(client.user.tag)
    }. Ready to serve ${client.guilds.cache.size} guild${plural(client.guilds.cache.size)}.`);
    client.user.setPresence({
        status: dev ? 'dnd' : 'idle',
        activity: { name: `ID : ${client.instanceId}` }
    })
})

client.login(process.env.DISCORD_TOKEN);

export default Bot;