import dotenv = require('dotenv'); dotenv.config();
import { AkairoClient, CommandHandler } from 'discord-akairo';
import { log } from './lib/logger';
import { join } from 'path'

import plural = require('./lib/plural');

class Bot extends AkairoClient {
    constructor() {
        super({ ownerID: [process.env.OWNER] });
        this.mainHandler.on('load', ({ id }) => log.success(`Loaded module : ${id}`))
        this.mainHandler.loadAll();
        log.success(`Loaded ${this.mainHandler.modules.size} command(s).`)
    }

    mainHandler = new CommandHandler(this, {
        blockBots: false,
        prefix: JSON.parse(process.env.PREFIX),
        allowMention: true,
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


require('./db/index')().then(() => {
    log.success('Successfully connected to database.');
    client.login(process.env.DISCORD_TOKEN)
})