import { Message, MessageEmbed } from 'discord.js';
import { FgoCommand } from './baseCommand';
import cache from '@pepper/modules/fgo/servant-details-preprocess';
import { plural as p } from '@pepper/utils';

const commandName = `servant-cache-control`;
const aliases = [commandName, `ccsc`];

export = class extends FgoCommand {
    constructor() {
        super(commandName, {
            aliases,
            ownerOnly: true,
            args: [{
                id: 'opt',
                type: 'string',
                description: 'Operation to work'
            }]
        })
    }

    async exec(m : Message, { opt } : { opt: string }) {
        let c = this.client.moduleHandler.findInstance(cache);
        let r = (e : MessageEmbed | string) => m.channel.send(e);
        switch (opt) {
            case `clean`:
                let _ = c.clean();
                return r(
                    new MessageEmbed()
                        .setDescription(`Cleaned ${_} module${p(_)}`)
                )
            case `size`:
                let s = c.cache.size;
                return r(
                    new MessageEmbed()
                        .setDescription(`${s} object${p(s)} are currently cached.`)
                )
            default:
                r(`Please specify an operation to perform : \`clean\` or \`size\``)
        }
    }
}