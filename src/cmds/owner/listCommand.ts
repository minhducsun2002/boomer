import { Message } from 'discord.js';
import { OwnerCommand } from './baseCommand';
import Bot from '../../';
import { relative } from 'path';

const commandName = 'list-cmds'
const aliases = [commandName, 'cmds', 'cmd', 'list-cmd']

export = class extends OwnerCommand {
    constructor() {
        super(commandName, {
            aliases,
            description: 'List loaded commands.'
        })
    }

    async exec(m: Message) {
        const handler = (this.client as Bot).cmdHandler;
        const cmds = handler.modules.array();
        m.channel.send(
            `Loaded ${cmds.length} commands.\n${
                cmds.map(({ id, filepath }) => `\`${id}\` -> \`${relative(handler.directory, filepath)}\``).join('\n')
            }`
        )
    }
}