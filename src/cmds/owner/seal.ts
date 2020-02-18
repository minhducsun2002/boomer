import { Message } from 'discord.js'
import { OwnerCommand } from './baseCommand';
import Bot from '../..';

const commandName = 'seal';
const aliases = [commandName]

export = class extends OwnerCommand {
    constructor() {
        super(commandName, {
            aliases,
            description: 'Lock down this instance. Specify the Instance ID to do so.',
            args: [{
                id: 'id',
                match: 'phrase',
                description: 'Instance ID'
            }]
        })
    }

    async exec(m : Message, { id } = { id: '' }) {
        const c = this.client as Bot;
        if (id === c.instanceId) {
            c.locked = !c.locked;
            m.channel.send(`This instance is now ${c.locked ? 'locked' : 'unlocked'}. Call \`${
                (this.handler.prefix as string[])[0]
            }${commandName} ${c.instanceId}\` again to ${c.locked ? 'unlock' : 'lock'}`)
        }
    }
}