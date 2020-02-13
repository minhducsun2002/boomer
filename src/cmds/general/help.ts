import { CommandHandler } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import { GeneralCommand } from './baseCommand';

const commandName = 'help', aliases = [commandName];

export = class extends GeneralCommand {
    constructor() {
        super(commandName, {
            aliases,
            typing: true,
            description: 'You know nothing? This will help.',
        })
    }

    async exec(m: Message) {
        const handler = (this.client as any).cmdHandler as CommandHandler;
        // I am not supposed to do this, but yikes
        let prefix = (handler.prefixes.size ? [...handler.prefixes.entries()][0][0] : handler.prefix) as string,
            [main] = aliases;
        let out = new MessageEmbed()
            .setAuthor('', this.client.user.avatarURL())
            .setDescription(
                `${this.client.user} is ready to serve you.`
                + `\nRun \`${prefix}${main} <category/command name>\` to see the respective help info.`
                + `\nHere are the available categories :`
                + `\`\`\`${[...handler.categories].map(([a]) => `* ${a}`).join('\n')}\`\`\``
            )

        m.channel.send(out);
    }
}