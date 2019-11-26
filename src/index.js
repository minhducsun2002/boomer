require('dotenv').config();
const { AkairoClient } = require('discord-akairo')
const chalk = require('chalk');

const client = new AkairoClient({
    ownerID: [process.env.OWNER],
    blockBots: false, // I have other bots
    prefix: JSON.parse(process.env.PREFIX || '[b!]'),
    allowMention: JSON.parse(process.env.PING_AS_PREFIX || 'false'),
    commandDirectory: './src/cmds'
})

if (process.env.NODE_ENV === 'development')
    client.on('debug', info => console.log(`${chalk.bgBlue.white('[Debug]')} ${info}`))

client.login(process.env.DISCORD_TOKEN)