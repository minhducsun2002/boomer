import { Message } from 'discord.js'
import { deriveBaseCommand } from '../../lib/classes/baseCommand';

export const OwnerCommand = class extends deriveBaseCommand({ category: 'Reserved' }) {
    userPermissions = (m: Message) => {
        return (this.client.ownerID as Array<String>).includes(m.author.id) ? null : 1
    }
}