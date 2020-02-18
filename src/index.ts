import { config } from 'dotenv'; config();
import { AkairoClient, CommandHandler } from 'discord-akairo';
import { log } from './lib/logger';
import { join } from 'path';
import r from 'csprng';

import cfg from './config';
import plural from './lib/plural';
import './db/';

const instanceIdLength = +cfg.get('instanceIdLength') || 4;

const owner = cfg.get('owner'), p = cfg.get('prefix');

class Bot extends AkairoClient {
    constructor() {
        super({ ownerID: Array.isArray(owner) ? owner : [owner] });
        this.cmdHandler.on('load', ({ id }) => log.success(`Loaded module : ${id}`))
        this.cmdHandler.loadAll();
        log.success(`Loaded ${this.cmdHandler.modules.size} module(s).`);
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

    cmdHandler = new CommandHandler(this, {
        blockBots: false,
        prefix: Array.isArray(p) ? p : [p],
        allowMention: cfg.get('pingAsPrefix') ?? true,
        directory: join(__dirname, 'cmds')
    })
}

const client : Bot = new Bot();
if (process.env.NODE_ENV === 'development') client.on('debug', log.info)

client.on('ready', () => {
    log.success(`Logged in as ${client.user.tag}. Ready to serve ${client.guilds.cache.size} guild${plural(client.guilds.cache.size)}.`);
    if (process.env.NODE_ENV === 'development')
        client.user.setPresence({
            status: 'dnd',
            activity: { name: 'debugging mode' }
        })
    else client.user.setPresence({ status: 'idle' })
})

client.login(process.env.DISCORD_TOKEN);

export default Bot;