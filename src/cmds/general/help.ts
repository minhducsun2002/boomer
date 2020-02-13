import { CommandHandler } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import { GeneralCommand } from './baseCommand';

import { ERROR_COLOR, SUCCESS_COLOR } from '../../constants/colors';

const commandName = 'help', aliases = [commandName];

interface Arg { q: string };

export = class extends GeneralCommand {
    constructor() {
        super(commandName, {
            aliases,
            typing: true,
            description: 'You know nothing? This will help.',
            args: [{
                id: 'q',
                type: 'string'
            }]
        })
    }

    async exec(m: Message, { q } : Arg) {
        const handler = (this.client as any).cmdHandler as CommandHandler;
        // I am not supposed to do this, but yikes
        let out : MessageEmbed | string = new MessageEmbed().setAuthor('', this.client.user.avatarURL()).setColor(SUCCESS_COLOR)

        let prefix = (handler.prefixes.size ? [...handler.prefixes.entries()][0][0] : handler.prefix) as string;
        if (q) {
            // check if category name
            if (handler.findCategory(q)) {
                const cat = handler.findCategory(q);
                out = out
                    .setDescription(`The following command(s) belong to the **${cat.id}** category :`)
                cat.forEach(({ description, aliases: [call] }) => out = (out as MessageEmbed).addField(
                    `\`${prefix}${call}\``,
                    description
                ))
            }
            else if (handler.findCommand(q)) {
                const cmd = handler.findCommand(q);
                out = out
                    .setTitle(`\`${prefix}${cmd.aliases[0]}\`${
                        aliases.length > 1
                        ? `\n(${aliases.slice(1).map(a => `\`${prefix}${a}\``).join(', ')})`
                        : ''
                    }`)
                    .setDescription(cmd.description)
            }
            else out = `${m.author}, I couldn't find any category or command with the name of ${q}`
        }
        else {
            let [main] = aliases;
        
            out = out
                .setDescription(
                    `${this.client.user} is ready to serve you.`
                    + `\nRun \`${prefix}${main} <category/command name>\` to see the respective help info.`
                    + `\nHere are the available categories :`
                    + `\`\`\`${[...handler.categories].map(([a]) => `* ${a}`).join('\n')}\`\`\``
                )
        }

        m.channel.send(out);
    }
}