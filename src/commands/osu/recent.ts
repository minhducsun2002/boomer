import { OsuCommand } from './baseCommand';
import { Message, MessageEmbed } from 'discord.js';
import { modes } from '@pepper/constants/osu'
import { fetchUser, fetchRecent, embedScoreset, fetchRecentApi, embedScoresetApi } from '@pepper/lib/osu';
import { paginatedEmbed } from '@pepper/utils';
import { accuracy } from '@pepper/lib/osu';
import type { CommandUtil } from 'discord-akairo';
import { embedSingleScore, embedSingleScoreApi } from '@pepper/lib/osu/embeds';

const singleModeAlias = 'rs';
const commandName = 'recent';
const aliases = [commandName, 'recentplay', 'rp', singleModeAlias];

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

    private async handleSingleMode(
        { user, user_id } : { user: string, user_id: number },
        mode_int : number,
        failed : boolean
    ) : Promise<MessageEmbed[]> {
        let out : MessageEmbed[] = [];
        if (failed) {
            let [score] = await fetchRecentApi(OSU_API_KEY, user, mode_int, 1);
            out = score ? [await embedSingleScoreApi(mode_int, score)] : [];
        }
        else {
            let [recent] = await fetchRecent(user_id, modes[mode_int], 1, 1);
            out = recent ? [await embedSingleScore(modes[mode_int], recent, user)] : [];
        }

        if (out.length) out[0] = out[0].setTitle(`Most recent play of user **${user}**`);
        return out;
    }

    async exec(m : Message & { util: CommandUtil }, { user, mode, failed, limit } = { user: '', mode: '', failed: false, limit: 20 }) {
        user = user?.trim();
        if (!modes.includes(mode)) mode = modes[0];
        // check mode
        if (!user) return m.channel.send(
            this.client.extras.Embeds.ERROR().setDescription('Who to check for recent scores?')
        );

        // special alias handling
        let singleMode = m.util.parsed.alias === singleModeAlias;

        try {
            let embeds : MessageEmbed[] = [];
            let { user: { id, username } } = await fetchUser(user, mode);
            let mode_int = modes.indexOf(mode) as keyof typeof accuracy;

            if (singleMode) embeds = await this.handleSingleMode({ user: username, user_id: id }, mode_int, failed);
            else {
                if (failed) {
                    let _ = await fetchRecentApi(OSU_API_KEY, user, mode_int, Math.min(limit, 10));
                    embeds = await embedScoresetApi(mode_int, _, 5)
                    for (let e of embeds)
                        e
                        .setTitle(`Recent plays of **${username}**`)
                        .setURL(`https://osu.ppy.sh/users/${id}`)

                } else {
                    // sanitize the number
                    if (!(Number.isSafeInteger(limit) && limit > 0 && limit < 51))
                        limit = 20;
                    // we got the ID, now we start fetching things
                    let recents = await fetchRecent(id, mode, limit, MAX_SINGLE);
                    embeds = embedScoreset(recents, username, id, mode)
                        .map(a => a.setTitle(`Recent plays of **${username}**`))
                }
            }

            if (embeds.length > 1)
                paginatedEmbed()
                    .setChannel(m.channel)
                    .setEmbeds(embeds)
                    .run({ idle: 20000, dispose: true })
            else
                m.channel.send(
                    embeds[0]
                    || new MessageEmbed().setDescription(
                        `No recent play found for user [**${username}**](https://osu.ppy.sh/users/${id}).`
                    )
                )
        }
        catch (e) {
            m.channel.send(this.client.extras.Embeds.ERROR(e));
        }
    }
}
