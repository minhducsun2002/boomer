import { Message, MessageEmbed } from 'discord.js'
import { GeneralCommand } from './baseCommand';
import Bot from '../..'

const commandName = 'info';
const aliases = [commandName];

export = class extends GeneralCommand {
    constructor() {
        super(commandName, {
            aliases,
            description: 'Some information about me.'
        })
    }

    async exec(m : Message) {
        const [r, u] = process.env.npm_package_repository_url.split('/').filter(a=>a).reverse()

        const { instanceId, user, ownerID, users } = this.client as Bot;
        const owner = (await users.fetch(ownerID[0]))
        const out = new MessageEmbed()
            .setTitle(`Hello, I am ${user.username}!`)
            .setDescription(
                `${user.username === m.guild.me.nickname ? '' : `_looks like someone named me ${user} instead_\n`}` +
                [
                    `I'm currently being maintained by ${owner.username}#${owner.discriminator}. Call him if you need anything. :wink:`,
                    `You may want to type \`b!help\` if you wish to know what I can do.`,
                    `If you are curious on how I work, feel free to check out [the source code](https://github.com/${u}/${r}).`
                ].join('\n')
            )
            .setTimestamp()
            .setFooter(`Instance ID : ${instanceId}`)
        m.channel.send('', out)
    }
}