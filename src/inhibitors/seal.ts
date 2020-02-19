import { Message } from 'discord.js'
import { Inhibitor, Command } from 'discord-akairo';
import Bot from '../';

const inhibitorName = 'seal';
export = class extends Inhibitor {
    constructor() {
        super(inhibitorName, {
            reason: 'This instance is locked down, unseal it before call commands',
            type: 'post'
        })
    }

    async exec(m : Message, c: Command) {
        if ((this.client as Bot).locked && (c.id !== 'seal')) {
            return true;
        }
        return false
    }
}