require('dotenv').config();
const { AkairoClient } = require('discord-akairo')
const chalk = require('chalk');

String.prototype.sentence = function () {
    return this.replace(/([^\W_]+[^\s-]*) */g, function (txt) {return txt.charAt(0).toUpperCase() + txt.substr(1);});
};

const log = (arg) => console.log(chalk.bgGreen.white('[Bot]') + ' ' + arg);

const client = new AkairoClient({
    ownerID: [process.env.OWNER],
    blockBots: false, // I have other bots
    prefix: JSON.parse(process.env.PREFIX || '[b!]'),
    allowMention: JSON.parse(process.env.PING_AS_PREFIX || 'false'),
    commandDirectory: './src/cmds'
})

if (process.env.NODE_ENV === 'development')
    client.on('debug', info => console.log(`${chalk.bgBlue.white('[Debug]')} ${info}`))

client.on('ready', () => log(`Logged in as ${client.user.tag}. Ready to serve ${client.guilds.size} guild${
    client.guilds.size > 1 ? 's' : ''
}.`))

require('./db/index')().then(() => {
    log('Successfully connected to database.');
    client.login(process.env.DISCORD_TOKEN)
})
