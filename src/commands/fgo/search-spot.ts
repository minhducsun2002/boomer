import { Message, MessageEmbed } from 'discord.js';
import { FgoCommand } from './baseCommand';
import { constructQuery as c } from '../../lib/fgo/';
import { ERROR_COLOR } from '../../constants/colors';
import { PagedEmbeds } from '@minhducsun2002/paged-embeds';
import { plural as p } from '@pepper/utils' ;
import { chunk } from '../../utils/chunk';

const commandName = 'search-spot';
const aliases = [commandName, 'ssp']
const MAX_PAGE = 15;
interface a { q?: string }

export = class extends FgoCommand {
    constructor() {
        super(commandName, {
            aliases, 
            args: [{
                id: 'q',
                match: 'rest'
            }],
            description: 'Search for spots.',
            typing: true
        })
    }

    async exec(m: Message, { q }: a) {
        const err = new MessageEmbed().setColor(ERROR_COLOR)
            .setDescription(`Sorry, couldn't find anything that matched.`)
        try {
            let a = +q;
            let _ = await c.mstSpot(isNaN(a) ? { name: q } : { id: a }, 0)
                .NA.select('name id').exec();
            
            if (_.length > MAX_PAGE)
                new PagedEmbeds()
                    .setChannel(m.channel)
                    .setEmbeds(
                        chunk(_, MAX_PAGE)
                            .map((s, i, c) => new MessageEmbed()
                                .setTitle(`Found ${_.length} spot${p(_.length)}.`)
                                .setDescription(s.map(({ name, id }) => `\`${id}\` **${name}**`).join('\n'))
                                .setFooter(`Page ${i + 1}/${c.length}`)
                            )
                    )
                    .addHandler(this.client.emojis.resolveIdentifier('⬅️'), (m, i, u, e, c) => {
                        return {
                            index: (i - 1 + e.length) % e.length,
                            embed: e
                        }
                    })
                    .addHandler(this.client.emojis.resolveIdentifier('➡️'), (m, i, u, e, c) => {
                        return {
                            index: (i + 1 + e.length) % e.length,
                            embed: e
                        }
                    })
                    .run({ idle: 20000, dispose: true })
            else
                m.channel.send(
                    '',
                    new MessageEmbed()
                        .setTitle(`Found ${_.length} spot${p(_.length)}.`)
                        .setDescription(_.map(({ name, id }) => `\`${id}\` **${name}**`).join('\n'))
                )
        }
        catch {
            m.channel.send(err.setDescription('Sorry, an error occurred.'))
        }
    }
}