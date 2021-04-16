import { OsuCommand } from './baseCommand';
import { Message, MessageEmbed } from 'discord.js';
import { ERROR_COLOR } from '../../constants/colors';
import { modes } from '@pepper/constants/osu'
import { fetchUser, fetchBest, embedScoreset } from '@pepper/lib/osu';
import { paginatedEmbed } from '@pepper/utils';
import { modbits } from 'ojsama';
import scoreCommand from './score';

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
                id: 'pos',
                match: 'option',
                description: 'Position to show as single score.',
                flag: ['#'],
                type: 'number'
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

    private modStringToBit(mods : string)
    {
        let ret = modbits.from_string(mods.trim());
        if ((ret & modbits.nc) == modbits.nc) ret = ret | modbits.dt;
        return ret;
    }

    async exec(m : Message, { user, mode, mod, limit, pos } = { user: '', mode: '', mod: '', limit: 50, pos: (null as number) }) {
        user = await this.resolveUserFromAuthor(user?.trim(), m.author.id);

        const err = new MessageEmbed().setColor(ERROR_COLOR)
            .setDescription(`Sorry, couldn't find anyone with username \`${user}\`.`)

        if (!user) return m.channel.send(err.setDescription(`Who to check for top scores?`));

        // interpret modstrings into modbits
        let modFilter = this.modStringToBit(mod?.trim() ?? '');

        if (!modes.includes(mode)) mode = modes[0];
        // check mode

        let { user: { id, username } } = await fetchUser(user, mode);
        // we got the ID, now we start fetching things

        if (!(Number.isSafeInteger(limit) && limit > 0 && limit < 51))
            limit = 50;
        let best = await fetchBest(id, mode, limit, MAX_SINGLE);

        // single mode ("top #25")
        if (pos > 0 && Number.isSafeInteger(pos)) {
            let [best] = await fetchBest(id, mode, MAX_RESULTS, MAX_SINGLE, pos - 1);
            if (!best)
                return m.channel.send(err.setDescription(
                    `No top play found for user [**${username}**](https://osu.ppy.sh/users/${id}) at position ${pos}.`
                ))

            let scCommand = this.handler.findCommand(new scoreCommand().aliases[0]);
            let _args = await scCommand.parse(m, `https://osu.ppy.sh/scores/${mode}/${best.id}`);
            return await scCommand.exec(m, _args);
        }

        // sort by descending pp
        best = best
            .sort((score1, score2) => score2.pp - score1.pp)
            .filter(score => {
                // without a filter, modFilter will always be 0, effectively filtering out
                // every play when AND'd
                if (!modFilter) return true;

                let scoreMods = this.modStringToBit(score.mods.join(''));
                return (scoreMods & modFilter) === modFilter;
            });

        let modSuffix = modFilter ? ` with ${modbits.string(modFilter)}` : '';
        let embeds = embedScoreset(best, username, id, mode)
            .map((a, i, c) => a.setFooter(`Top plays${modSuffix} - page ${i + 1}/${c.length} | All times are UTC`));

        if (best.length > 1)
            paginatedEmbed()
                .setChannel(m.channel)
                .setEmbeds(embeds)
                .run({ idle: 20000, dispose: true })
        else
            m.channel.send(
                embeds[0]?.setFooter(`All times are UTC`)
                || new MessageEmbed()
                    .setDescription(`No top play found for user [**${username}**](https://osu.ppy.sh/users/${id})${modSuffix}.`)
            )
    }
}
