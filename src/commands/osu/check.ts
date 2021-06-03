import { OsuCommand } from "./baseCommand";
import { Message } from 'discord.js';
import { modes } from '@pepper/constants/osu';
import ScoreCommand from './score';

export = class extends OsuCommand {
    constructor() {
        super('check', {
            aliases: ['c', 'check'],
            args: [{
                id: 'username',
                description: 'Username to check for score on the current map.',
                match: 'rest'
            }, {
                id: 'mode',
                match: 'option',
                description: `Gamemode to show. Can be ${modes.map(a => '`' + a + '`').join(', ')}.`,
                flag: ['/']
            }]
        })
    }

    async exec(m : Message, { username, mode } = { username: '', mode: '' }) {
        let user = await this.resolveUserFromAuthor(username?.trim(), m.author.id);
        return this.handler.findCommandInstance(ScoreCommand)
            .exec(m, {
                beatmap: this.mapIdCache.getChannelMapId(m.channel.id)?.toString(),
                username: user,
                mode
            });
    }
}