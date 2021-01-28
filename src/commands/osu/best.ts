import { OsuCommand } from './baseCommand';
import { Message, MessageEmbed } from 'discord.js';
import { ERROR_COLOR } from '../../constants/colors';
import { modes } from '@pepper/constants/osu'
import { fetchUser, fetchBest, embedScoreset } from '@pepper/lib/osu';
import { paginatedEmbed } from '@pepper/utils';
import { modbits } from 'ojsama';

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
            }, {
                id: 'mod',
                match: 'option',
                description: `Filter plays with certain mods. Applied after retrieving plays.`,
                flag: ['/mod=', '/mod:'],
                type: 'string'
            }],
            cooldown: 3 * 1000
            // 3s
        })
    }

    async exec(m : Message, { user, mode, mod, limit } = { user: '', mode: '', mod: '', limit: 50 }) {
        user = user?.trim();

        // interpret modstrings into modbits
        let modFilter = modbits.from_string(mod?.trim() ?? '');

        if (!modes.includes(mode)) mode = modes[0];
        // check mode
        const err = new MessageEmbed().setColor(ERROR_COLOR)
            .setDescription(`Sorry, couldn't find anyone with username \`${user}\`.`)
        try {
            let { user: { id, username } } = await fetchUser(user, mode);
            // we got the ID, now we start fetching things

            if (!(Number.isSafeInteger(limit) && limit > 0 && limit < 51))
                limit = 50;
            let best = await fetchBest(id, mode, limit, MAX_SINGLE);

            // sort by descending pp
            best = best
                .sort((score1, score2) => score2.pp - score1.pp)
                .filter(score => {
                    // without a filter, modFilter will always be 0, effectively filtering out
                    // every play when AND'd
                    if (!modFilter) return true;

                    let scoreMods = modbits.from_string(score.mods.join(''));
                    return (scoreMods & modFilter) === modFilter;
                });

            let modSuffix = modFilter ? ` with ${modbits.string(modFilter)}` : '';

            if (best.length)
                paginatedEmbed()
                    .setChannel(m.channel)
                    .setEmbeds(
                        embedScoreset(best, username, id, mode)
                            .map(a => a.setTitle(`Top plays of **${username}**${modSuffix}`))
                    )
                    .run({ idle: 20000, dispose: true })
            else
                m.channel.send(
                    new MessageEmbed()
                        .setDescription(
                            `No top play found for user [**${username}**](https://osu.ppy.sh/users/${id})${modSuffix}.`
                        )
                )
        }
        catch (e) {
            m.channel.send(err.setDescription(`Sorry, an error occurred.`));
        }
    }
}
