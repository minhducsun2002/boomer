import { Command, CommandHandler } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';

const commandName = 'help', aliases = [commandName];

export = class extends Command {
    constructor() {
        super(commandName, {
            aliases,
            typing: true,
            description: 'You know nothing? This will help.'
        })
    }

    async exec(m: Message) {
        const handler = (this.client as any).mainHandler as CommandHandler;
        // I am not supposed to do this, but yikes
        let out = new MessageEmbed(), [prefix] = handler.prefixes;
        handler.modules.forEach(cmd => out = out.addField(`\`${prefix || handler.prefix}${cmd.id}\``, cmd.description || 'N/A'))
        m.channel.send(out);
    }
}