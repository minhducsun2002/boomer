import { OsuCommand } from './baseCommand';
import { Message, MessageEmbed } from 'discord.js';
import { ERROR_COLOR } from '../../constants/colors';
import { modes } from '@pepper/constants/osu'
import { fetchUser, fetchBest, embedScoreset } from '@pepper/lib/osu';
import { paginatedEmbed } from '@pepper/utils';

const commandName = 'best';
const aliases = [commandName, 'top'];

const MAX_RESULTS = 100, MAX_SINGLE = 50;

export = class extends OsuCommand {
    constructor() {
        super(commandName, {
            aliases,
            description: 'Show best play(s) of an osu! player.',
            args: [{
                id: 'user',
                match: 'rest',
                description: 'Username to search.'
            }, {
                id: 'mode',
                match: 'option',
                description: `Gamemode to show. Can be ${modes.map(a => `\`${a}\``).join(', ')}.`,
                flag: ['/']
            }, {
                id: 'limit',
                match: 'option',
                description: `Limit the number of plays to retrieve. Must not be greater than ${MAX_RESULTS}.`,
                flag: ['/limit=', '/limit:'],
                type: 'number'
            }],
            cooldown: 3 * 1000
            // 3s
        })
    }

    async exec(m : Message, { user, mode, limit } = { user: '', mode: '', limit: 20 }) {
        user = user.trim();
        if (!modes.includes(mode)) mode = modes[0];
        // check mode
        const err = new MessageEmbed().setColor(ERROR_COLOR)
            .setDescription(`Sorry, couldn't find anyone with username \`${user}\`.`)
        try {
            let { user: { id, username } } = await fetchUser(user, mode);
            // we got the ID, now we start fetching things

            let recents = await fetchBest(id, mode, limit, MAX_SINGLE);
            
            if (recents.length) 
                paginatedEmbed()
                    .setChannel(m.channel)
                    .setEmbeds(
                        embedScoreset(recents, username, id, mode)
                            .map(a => a.setTitle(`Top plays of **${username}**`))
                    )
                    .run({ idle: 20000, dispose: true })
            else
                m.channel.send(
                    new MessageEmbed()
                        .setDescription(`No recent play found for user [**${username}**](https://osu.ppy.sh/users/${id}).`)
                )
        }
        catch (e) {
            m.channel.send(err.setDescription(`Sorry, an error occurred.`));
        }
    }
}
