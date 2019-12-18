import dotenv = require('dotenv'); dotenv.config();
import { AkairoClient, CommandHandler } from 'discord-akairo';
import chalk = require('chalk');

import plural = require('./lib/plural');

let log : Function = (t : String) => console.log(chalk.bgGreen.white('[Bot]') + ' ' + t);

class Bot extends AkairoClient {
    constructor() {
        super({ ownerID: [process.env.OWNER] });
        this.mainHandler.loadAll();
        log(`Loaded ${this.mainHandler.modules.size} command(s).`)
    }

    mainHandler = new CommandHandler(this, {
        blockBots: false,
        prefix: JSON.parse(process.env.PREFIX),
        allowMention: true,
        directory: './src/cmds'
    })
}

const client : Bot = new Bot();
if (process.env.NODE_ENV === 'development')
    client.on('debug', info => console.log(`${chalk.bgBlue.white('[Debug]')} ${info}`))

client.on('ready', () => {
    log(`Logged in as ${client.user.tag}. Ready to serve ${client.guilds.size} guild${plural(client.guilds.size)}.`);
    if (process.env.NODE_ENV === 'development')
        client.user.setPresence({
            status: 'dnd',
            game: { name: 'debugging mode' }
        })
    else client.user.setPresence({ status: 'idle', game: {} })
})


require('./db/index')().then(() => {
    log('Successfully connected to database.');
    client.login(process.env.DISCORD_TOKEN)
})