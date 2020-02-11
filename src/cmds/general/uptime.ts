import { Command } from 'discord-akairo';
import { RichEmbed, Message } from 'discord.js';
import { Duration, TimeUnit } from 'timezonecomplete';

const commandName = 'uptime';
const aliases = [commandName, 'up']

export = class extends Command {
    constructor() {
        super(commandName, {
            aliases,
            typing: true,
            description: 'How long has I been running?'
        })
    }

    async exec(m : Message) {
        const o = new Duration(this.client.uptime).toFullString()
        m.channel.send('', {
            embed: new RichEmbed().setDescription(`:alarm_clock: ${this.client.user} been running for ${o}.`)
        })
    }
}