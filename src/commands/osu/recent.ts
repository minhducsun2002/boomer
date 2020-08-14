import { OsuCommand } from './baseCommand';
import { Message, MessageEmbed } from 'discord.js';
import { ERROR_COLOR } from '../../constants/colors';
import { modes } from '@pepper/constants/osu'
import { fetchUser, fetchRecent, embedScoreset, fetchRecentApi, embedScoresetApi } from '@pepper/lib/osu';
import { paginatedEmbed } from '@pepper/utils';
import { accuracy } from '@pepper/lib/osu';

const commandName = 'recent';
const aliases = [commandName, 'recentplay', 'rp'];

const MAX_RESULTS = 100, MAX_SINGLE = 50;
const { OSU_API_KEY } = process.env;

export = class extends OsuCommand {
    constructor() {
        super(commandName, {
            aliases,
            description: 'Show recent play(s) of an osu! player.',
            args: [{
                id: 'user',
                match: 'rest',
                description: 'Username to search.'
            }, {
                id: 'mode',
                match: 'option',
                description: 'Gamemode to show. Can be `osu`, `taiko`, `fruits`, `mania`.',
                flag: ['/']
            }, {
                id: 'failed',
                match: 'flag',
                description: 'Whether to show failed plays. Use another method to get scores.',
                flag: ['/f', '/failed']
            }],
            cooldown: 3 * 1000
            // 3s
        })
    }

    async exec(m : Message, { user, mode, failed } = { user: '', mode: '', failed: false }) {
        user = user.trim();
        if (!modes.includes(mode)) mode = modes[0];
        // check mode
        const err = new MessageEmbed().setColor(ERROR_COLOR)
            .setDescription(`Sorry, couldn't find anyone with username \`${user}\`.`)
        try {
            let embeds : MessageEmbed[] = [];
            let { user: { id, username } } = await fetchUser(user, mode);
            let mode_int = modes.indexOf(mode) as keyof typeof accuracy;
            if (failed) {
                let _ = await fetchRecentApi(OSU_API_KEY, user, mode_int, 10);
                embeds = await embedScoresetApi(mode_int, _, 5)
                for (let e of embeds) 
                    e
                    .setTitle(`Recent plays of **${username}**`)
                    .setURL(`https://osu.ppy.sh/users/${id}`)
                
            } else {
                // we got the ID, now we start fetching things
                let recents = await fetchRecent(id, mode, MAX_RESULTS, MAX_SINGLE);
                embeds = embedScoreset(recents, username, id, mode)
                    .map(a => a.setTitle(`Recent plays of **${username}**`))
            }
            if (embeds.length) 
                paginatedEmbed()
                    .setChannel(m.channel)
                    .setEmbeds(embeds)
                    .run({ idle: 20000, dispose: true })
            else
                m.channel.send(
                    new MessageEmbed()
                        .setDescription(`No recent play found for user [**${username}**](https://osu.ppy.sh/users/${id}).`)
                )
        }
        catch (e) {
            console.log(e);
            m.channel.send(err.setDescription(`Sorry, an error occurred.`));
        }
    }
}