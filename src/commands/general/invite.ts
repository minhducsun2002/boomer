import { Message, MessageEmbed } from 'discord.js'
import { GeneralCommand } from './baseCommand';

const commandName = 'invite';
const aliases = [commandName];

export = class extends GeneralCommand {
    constructor() {
        super(commandName, {
            aliases
        })
    }

    async exec(m : Message) {
        m.channel.send(
            '',
            new MessageEmbed()
                .setDescription(`You may invite me to your server using [this link](${
                    await this.client.generateInvite([
                        'MANAGE_MESSAGES',
                        'ADMINISTRATOR', 'USE_EXTERNAL_EMOJIS',
                        'VIEW_CHANNEL', 'SEND_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES',
                        'SPEAK',
                        'ADD_REACTIONS', 'CHANGE_NICKNAME'
                    ])
                }).`)
        )
    }
}