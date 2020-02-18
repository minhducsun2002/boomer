import { config } from 'dotenv'; config();
import { AkairoClient, CommandHandler } from 'discord-akairo';
import { log } from './lib/logger';
import { join } from 'path';
import r from 'csprng';

import cfg from './config';
import plural from './lib/plural';
import './db/';

const owner = cfg.get('owner')

class Bot extends AkairoClient {
    constructor() {
        super({ ownerID: Array.isArray(owner) ? owner : [owner] });
        this.cmdHandler.on('load', ({ id }) => log.success(`Loaded module : ${id}`))
        this.cmdHandler.loadAll();
        log.success(`Loaded ${this.cmdHandler.modules.size} module(s).`);
    }

    instanceId = r(256, 32).slice(0, 4);

    cmdHandler = new CommandHandler(this, {
        blockBots: false,
        prefix: cfg.get('prefix'),
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