import { Message } from 'discord.js'
import { deriveBaseCommand } from '../../lib/classes/baseCommand';

export const OwnerCommand = class extends deriveBaseCommand({ category: 'Reserved' }) {
    userPermissions = (m: Message) => {
        const pass = (this.client.ownerID as Array<String>).includes(m.author.id);
        if (!pass)
            m.channel.send(`${m.author}, this command can only be called by my owner, sorry for that.`)
        return pass ? null : 1
    }
}