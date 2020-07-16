import { MessageEmbed, Message } from 'discord.js';
import { Duration } from 'timezonecomplete';
import { GeneralCommand } from './baseCommand'

const commandName = 'uptime';
const aliases = [commandName, 'up']

export = class extends GeneralCommand {
    constructor() {
        super(commandName, {
            aliases,
            typing: true,
            description: 'How long has I been running?'
        })
    }

    async exec(m : Message) {
        let inline = true;
        m.channel.send(
            new MessageEmbed()
                .addFields([{
                    name: 'Process uptime',
                    value: `${new Duration(process.uptime() * 1000).toFullString()}`,
                    inline
                }, {
                    name: 'Connection uptime',
                    value: `${new Duration(this.client.uptime).toFullString()}`,
                    inline
                }])
        )
    }
}