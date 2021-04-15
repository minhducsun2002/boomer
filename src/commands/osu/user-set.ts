import { OsuCommand } from './baseCommand';
import { Message } from 'discord.js';
import UsernameDb from '@pepper/modules/osu/username-db';

const commandName = 'user-set';
const aliases = [commandName, 'set', 'save'];

export = class extends OsuCommand {
    constructor() {
        super(commandName, {
            aliases,
            description: 'Set your osu! username with this command',
            locked: true,
            args: [{
                id: 'username',
                match: 'rest',
                description: 'Username to (un)set'
            }, {
                id: 'unset',
                match: 'flag',
                flag: ['/unset'],
                description: 'Unset the username'
            }]
        })
    }

    async exec(m : Message, { username, unset } : { username: string, unset: boolean }) {
        let userDb = this.client.moduleHandler.findInstance(UsernameDb);
        if (unset) {
            let record = await userDb.unsetUser(m.author.id);
            return m.channel.send(`${m.author.toString()} is no longer bound to ${
                record ? `username **${record.osuUsername}**` : `any username`
            }.`);
        }
        if (!username)
            return m.channel.send(`Please specify an username to bind.`)

        await userDb.setUser(m.author.id, username);
        return m.channel.send(`${m.author.toString()} is now bound to username **${username}**.`);
    }
}
