require('dotenv').config();
const { AkairoClient, CommandHandler } = require('discord-akairo')
const chalk = require('chalk');

String.prototype.sentence = function () {
    return this.replace(/([^\W_]+[^\s-]*) */g, function (txt) {return txt.charAt(0).toUpperCase() + txt.substr(1);});
};

const log = (arg) => console.log(chalk.bgGreen.white('[Bot]') + ' ' + arg);

class Bot extends AkairoClient {
    constructor() {
        super({ ownerID: [process.env.OWNER] });

        this.mainHandler = new CommandHandler(this, {
            blockBots: false, // I have other bots
            prefix: JSON.parse(process.env.PREFIX),
            allowMention: true,
            directory: './src/cmds'
        })

        this.mainHandler.loadAll();
        log(`Loaded ${this.mainHandler.modules.size} command(s).`)
    }
}

const client = new Bot();

if (process.env.NODE_ENV === 'development')
    client.on('debug', info => console.log(`${chalk.bgBlue.white('[Debug]')} ${info}`))

client.on('ready', () => {
    log(`Logged in as ${client.user.tag}. Ready to serve ${client.guilds.size} guild${
        client.guilds.size > 1 ? 's' : ''
    }.`);
    if (process.env.NODE_ENV === 'development')
        client.user.setPresence({
            game: { name: 'debugging mode' }
        })
})

require('./db/index')().then(() => {
    log('Successfully connected to database.');
    client.login(process.env.DISCORD_TOKEN)
})
