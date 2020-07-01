import { Message, MessageEmbed } from 'discord.js';
import { OwnerCommand } from './baseCommand';
import { relative as rel } from 'path';
import { PagedEmbeds } from '@minhducsun2002/paged-embeds';
import { chunk, plural as p } from '@pepper/utils';

const commandName = 'list-cmds';
const aliases = [commandName, 'cmds', 'cmd', 'list-cmd']

export = class extends OwnerCommand {
    constructor() {
        super(commandName, {
            aliases,
            description: 'List loaded commands.'
        })
    }

    async exec(m: Message) {
        const page = 5;
        const h = this.client.commandHandler;
        const c = h.modules.array();
        let out = chunk(c, page)
            .map(
                (a, i, _) => new MessageEmbed()
                    .setTitle(`Loaded command modules`)
                    .setDescription(
                        `Currently loaded ${c.length} command${p(c.length)} from \`${h.directory}\``
                    )
                    .addFields(
                        a.map(p => ({
                            name: p.id,
                            value: 
                                `Path: \`${rel(h.directory, p.filepath)}\``
                                + `\nCategory: ${p.categoryID || 'N/A'}`
                        }))
                    )
                    .setFooter(`Page ${i + 1}/${_.length}`)
            )
        new PagedEmbeds()
            .setChannel(m.channel)
            .setEmbeds(out)
            .run({ idle: 20000, dispose: true })
    }
}