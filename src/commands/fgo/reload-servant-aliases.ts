import { FgoCommand } from './baseCommand';
import type { Message } from 'discord.js';
import preprocessor from '@pepper/modules/fgo/servant-details-preprocess';
import aliases from '@pepper/modules/fgo/servant-aliases';

const commandName = 'reload-servant-aliases';

export = class extends FgoCommand {
    constructor() {
        super('reload-servant-aliases', {
            aliases: [commandName, 'reload-aliases', 'reload-alias', 'alias-reload'],
            description: 'Reload alias list for servant searches.',
            ownerOnly: true
        })
    }

    async exec(m : Message) {
        let _aliases = this.resolveModule(aliases);
        let _preprocessor = this.resolveModule(preprocessor);
        await _aliases.load()
            .then(_ => m.channel.send(`Loaded names & aliases for ${_.length} servants.`));
        await _preprocessor.load()
            .then(_ => m.channel.send(`Queued record refreshing jobs for ${_.length} servants with new aliases.`));
    }
}