import { config } from 'dotenv'; config();
import { AkairoClient, CommandHandler, InhibitorHandler } from 'discord-akairo';
import { log } from './lib/logger';
import { join } from 'path';
import r from 'csprng';

import cfg from './config';
import plural from './lib/plural';
import './db/';

const instanceIdLength = +cfg.get('instanceIdLength') || 4;

const owner = cfg.get('owner'), p = cfg.get('prefix'), dev = process.env.NODE_ENV === 'development';

class Bot extends AkairoClient {
    constructor() {
        super({ ownerID: Array.isArray(owner) ? owner : [owner] });
        log.success(`Loaded ${
            this.cmdHandler.on('load', ({ id }) => log.success(`Loaded module : ${id}`)).loadAll().modules.size
        } commands.`);
        log.success(`Loaded ${
            this.inhibitorHandler.on('load', ({ id }) => log.success(`Loaded inhibitor : ${id}`)).loadAll().modules.size
        } inhibitor(s).`)

        this.cmdHandler.useInhibitorHandler(this.inhibitorHandler);
        log.success(`Setup command handler to use inhibitors from ${this.inhibitorHandler.directory}.`)
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
        prefix: Array.isArray(p) ? p : [p],
        allowMention: cfg.get('pingAsPrefix') ?? true,
        directory: join(__dirname, 'cmds')
    })
}

const client : Bot = new Bot();
if (dev) client.on('debug', log.info)

client.on('ready', () => {
    log.success(`Logged in as ${client.user.tag}. Ready to serve ${client.guilds.cache.size} guild${plural(client.guilds.cache.size)}.`);
    client.user.setPresence({
        status: dev ? 'dnd' : 'idle',
        activity: { name: `ID : ${client.instanceId}` }
    })
})

client.login(process.env.DISCORD_TOKEN);

export default Bot;