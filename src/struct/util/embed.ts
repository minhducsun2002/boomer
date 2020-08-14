import { MessageEmbed } from 'discord.js';
import type { User } from 'discord.js';

/**
 * Template embeds
 */
export const Embeds = {
    PERMISSION_DENIED: (u : User) => new MessageEmbed()
        .setTitle(`Permission denied`)
        .setColor('#f00')
        .setDescription(`${u}, you are not allowed to execute this command.`),
    ERROR: (s? : string) => new MessageEmbed({
        description: `Sorry, an error occurred.` + (s ? '```' + s + '```' : ''),
        color: '#f00'
    })
}