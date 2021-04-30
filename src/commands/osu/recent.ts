import { OsuCommand } from './baseCommand';
import { Message, MessageEmbed } from 'discord.js';
import { modes } from '@pepper/constants/osu';
import {
    accuracy, fetchUser, fetchRecent, fetchRecentApi,
    embedScoreset, embedScoresetApi, embedSingleScore, embedSingleScoreApi
} from '@pepper/lib/osu';
import { paginatedEmbed } from '@pepper/utils';
import type { CommandUtil } from 'discord-akairo';

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
            out = score ? [await embedSingleScoreApi(mode_int, score, user)] : [];
        }
        else {
            let [recent] = await fetchRecent(user_id, modes[mode_int], 1, 1);
            out = recent ? [await embedSingleScore(modes[mode_int], recent, user)] : [];
        }

        return out;
    }

    async exec(m : Message & { util: CommandUtil }, { user, mode, failed, limit } = { user: '', mode: '', failed: false, limit: 20 }) {
        user = await this.resolveUserFromAuthor(user?.trim(), m.author.id);
        limit = limit ?? 20;
        if (!modes.includes(mode)) mode = modes[0];
        // check mode
        if (!user)
            return m.channel.send(
                this.client.extras.Embeds.ERROR().setDescription('Who to check for recent scores?')
            )


        // special alias handling
        let singleMode = m.util.parsed.alias.toLowerCase() === singleModeAlias;

        let embeds : MessageEmbed[] = [];
        let { user: { id, username } } = await fetchUser(user, mode);
        let mode_int = modes.indexOf(mode) as keyof typeof accuracy;

        if (singleMode) embeds = await this.handleSingleMode({ user: username, user_id: id }, mode_int, failed);
        else {
            if (failed) {
                let _ = await fetchRecentApi(OSU_API_KEY, user, mode_int, Math.min(limit, 10));
                embeds = await embedScoresetApi(mode_int, _, 5)
                for (let e of embeds.entries())
                    e[1].setAuthor(username, `https://a.ppy.sh/${id}`, `https://osu.ppy.sh/users/${id}`)

            } else {
                // sanitize the number
                if (!(Number.isSafeInteger(limit) && limit > 0 && limit < 51))
                    limit = 20;
                // we got the ID, now we start fetching things
                let recents = await fetchRecent(id, mode, limit, MAX_SINGLE);
                embeds = embedScoreset(recents, username, id, mode)
                    .map((a, i, c) => a.setFooter(`Recent plays - page ${i + 1}/${c.length}`))
            }
        }

        if (embeds.length > 1)
            paginatedEmbed()
                .setChannel(m.channel)
                .setEmbeds(embeds.map((e, i) => e.setFooter(`Recent plays - page ${i + 1}/${embeds.length} | All times are UTC`)))
                .run({ idle: 20000, dispose: true })
        else
            m.channel.send(
                embeds[0]
                || new MessageEmbed().setDescription(
                    `No recent play found for user [**${username}**](https://osu.ppy.sh/users/${id}).`
                )
            )
    }
}
