import { Message } from 'discord.js';
import { OwnerCommand } from './baseCommand';
import CommandEnablement from '@pepper/inhibitors/command-enablement';

const commandName = 'toggle-cmd';
const aliases = [commandName]

export = class extends OwnerCommand {
    constructor() {
        super(commandName, {
            aliases,
            description: 'Toggle the locking state of a command',
            args: [{
                id: 'command',
                match: 'phrase',
                type: 'string',
                description: 'Command to toggle.'
            }, {
                id: 'guild',
                match: 'phrase',
                type: 'string',
                description: 'Guild ID to toggle'
            }]
        })
    }

    async exec(m: Message, { command: _command, guild: _guild } : { command : string, guild: string }) {
        let command = this.handler.findCommand(_command);
        _guild = _guild || m.guild.id;
        if (!command) return m.channel.send(`Couldn't found a matching command.`);
        if (!command.locked) return m.channel.send(`\`${command.id}\` is not a lock-able command.`);

        let commandEnablement = this.client.inhibitorHandler.findInstance(CommandEnablement);
        if (commandEnablement.records.get(command.id)?.has(_guild)) {
            await commandEnablement.removeWhitelist(command.id, _guild);
        } else {
            await commandEnablement.addWhitelist(command.id, _guild);
        }
        let state = commandEnablement.records.get(command.id)?.has(_guild);
        m.channel.send(
            state
                ? `Allowed command \`${command.id}\` to be called from guild ID ${_guild}.`
                : `Prevented guild ID ${_guild} from calling command \`${command.id}\`.`
        );
    }
}