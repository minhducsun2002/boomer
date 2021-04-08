import { Message, MessageEmbed } from 'discord.js';
import { OwnerCommand } from './baseCommand';
import { SUCCESS_COLOR } from '@pepper/constants/colors';

export = class extends OwnerCommand {
    constructor() {
        super('status', {
            aliases: ['status', 'set-status'],
            args: [{
                id: 'status',
                match: 'restContent',
                type: 'string',
                description: 'Status to set if any.'
            }]
        })
    }

    async exec(m : Message, { status } : { status : string }) {
        m.client.user.setPresence(status ? { activity: { name: status } } : {})
            .then(() => m.channel.send(
                new MessageEmbed().setColor(SUCCESS_COLOR)
                    .setTitle(status ? `Status set` : `Cleared status.`)
                    .setDescription(status)
            ));
    }
}