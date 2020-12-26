import { MessageEmbed } from 'discord.js';
import type { User } from 'discord.js';
import type { PepperCommand } from '@pepper/struct';

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
    }),
    COMMAND_ERROR: (err : string, c : PepperCommand) => {
        let errorLines = err.split('\n');
        let error = '';
        for (let line of errorLines)
            if (error.length > 1500) break;
            else error += line + '\n';
        return new MessageEmbed({
            description: `Apologize, execution of command \`${c.id}\` failed with the following error :`
                + '```' + (error.trim() || 'No error log.') + '```',
            color: '#f00'
        })
    }
}