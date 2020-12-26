import type { ArgumentOptions } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import { GeneralCommand } from './baseCommand';
import i from './info';

const commandName = 'help', aliases = [commandName];

export = class extends GeneralCommand {
    constructor() {
        super(commandName, {
            aliases,
            typing: true,
            description: 'You know nothing? This will help.',
            args: [{
                id: 'q',
                type: 'string',
                match: 'rest'
            }]
        })
    }

    async exec(m: Message, { q } : { q: string }) {
        const handler = this.client.commandHandler;
        // I am not supposed to do this, but yikes
        let out : MessageEmbed | string = new MessageEmbed()
            .setAuthor(
                `${this.client.user.username}#${this.client.user.discriminator}`,
                this.client.user.avatarURL()
            )

        let prefix = (handler.prefixes.size ? [...handler.prefixes.entries()][0][0] : handler.prefix) as string;
        if (Array.isArray(prefix)) [prefix] = prefix;
        if (q) {
            // check if category name
            if (handler.findCategory(q)) {
                const cat = handler.findCategory(q);
                out = out
                    .setDescription(`The following command(s) belong to the **${cat.id}** category :`)
                cat.forEach(({ description, aliases: [call, ...calls], prefix: _p }) => {
                    let __ = _p ?? prefix;
                    return out = (out as MessageEmbed).addField(
                        `\`${__}${call}\`${
                            calls.length
                            ? ` (${calls.map(a => `\`${__}${a}\``).join(', ')})`
                            : ''
                        }`,
                        description || 'No description specified.'
                    );
                })
            }
            else if (handler.findCommand(q)) {
                const cmd = handler.findCommand(q);
                let _p = cmd.prefix ?? prefix;
                const mainCall = `${_p}${cmd.aliases[0]}`, args = ((cmd.args || []) as ArgumentOptions[])
                out = out
                    .setTitle(`\`${mainCall}\`${
                        (cmd.aliases.length > 1)
                        ? `\n(${cmd.aliases.slice(1).map(a => `\`${_p}${a}\``).join(', ')})`
                        : ''
                    }`)
                    .setDescription(cmd.description)
                    .addField(
                        `Syntax`,
                        `\`${
                            `${mainCall} ${
                                args.map(({ id, match, multipleFlags }) => `[${id}:${match}${multipleFlags ? '+' : ''}]`).join(' ')
                            }`.trim()
                        }\`` +
                        `\n\n${args.map(({ id, description }) => `- \`${id}\` ${description}`).join('\n')}`
                    )
                if (args.filter(a => a.match === 'flag' || a.match === 'option').length) {
                    const f = args.filter(a => a.match === 'flag' || a.match === 'option');
                    out = out.addField(
                        `Flags`,
                        f.map(({ flag, id, match }) => {
                            if (!Array.isArray(flag)) flag = [flag];
                            return `\`${id}\` **:** ${flag.map(a => `\`${a}\``).join('|')} ${
                                match === 'option' ? `(+ content)` : ''
                            }`
                        }).join('\n')
                    )
                }
                if (args.filter(a => a.multipleFlags).length)
                    out = out.setFooter(`+ means flag can be used multiple times.`)
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
                .addField(
                    'Syntax description',
                    `A command's arguments are shown in the form of \`[name:type]\`.`
                    + `\nThe following types are supported :\n`
                    +
                    [
                        [`phrase`, `matches by the order of the phrases inputted, ignoring flags/options.`],
                        [`flag`, `matches specified phrases, evaluated to \`true\` if present, \`false\` otherwise.`],
                        [`option`, 'as `flag`, but evaluated to the phrase after the flag.'],
                        [`rest`, `matches the rest, ignoring flags/options, preserving whitespaces/quotes.`]
                    ].map(([name, desc]) => `- \`${name}\` ${desc}`).join('\n')
                )
        }

        if (out instanceof MessageEmbed)
            out = out.setFooter(`Call ${prefix}${new i().aliases[0]} for info about me.`)
                .setTimestamp()

        m.channel.send(out);
    }
}