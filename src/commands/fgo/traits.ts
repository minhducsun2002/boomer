import { Message, MessageEmbed } from 'discord.js';
import { FgoCommand } from './baseCommand';
import { Trait } from '@pepper/constants/fgo';
import { Trait as t } from '@pepper/constants/fgo/strings';
import { paginatedEmbed } from '@pepper/utils';

const commandName = 'servant-traits';
const aliases = ['t', 'trait', 'traits'];

export = class extends FgoCommand {
    constructor() {
        super(commandName, {
            aliases,
            description: `List all known traits.`,
            typing: true,
            args: [{
                id: 'all',
                match: 'flag',
                flag: ['/a', '-a', 'all'],
                description: 'Fit as many traits into one embed as possible.'
            }]
        })
    }

    MAX_ENTRIES = 20;
    async exec(m : Message, { all } = { all: false }) {
        let _ = Object.values(Trait).filter(a => !isNaN(+a));
        let __ = _.map(a => `\`${a}\` ${t[a as keyof typeof t] || ''}`.trim());
        let pages : string[] = [];
        let s = '', c = 0;
        for (let p of __) {
            let limited = c >= this.MAX_ENTRIES;
            if (s.length + p.length + 1 > 2000 || (limited && !all)) {
                pages.push(s);
                s = p + '\n';
                c = 1;
            }
            else {
                s += p + `\n`;
                c++;
            };
        };
        if (s.length) pages.push(s);
        
        if (pages.length == 1)
            m.channel.send(new MessageEmbed().setTitle(`Known traits`).setDescription(pages[0]));
        else
            paginatedEmbed()
                .setChannel(m.channel)
                .setEmbeds(
                    pages.map(
                        (_, i, a) => new MessageEmbed()
                            .setTitle(`Known traits`)
                            .setDescription(_)
                            .setFooter(`Page ${i + 1}/${a.length}`)
                    )
                )
                .run({ idle: 20000, dispose: true })
    }
}