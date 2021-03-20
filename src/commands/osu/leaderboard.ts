import { OsuCommand } from './baseCommand';
import { Message, MessageEmbed } from 'discord.js';
import { checkURL, fetchUser, fetchMapset, Beatmapset } from '@pepper/lib/osu';
import { modes } from '@pepper/constants/osu';
import Users from '@pepper/modules/osu/username-db';
import { chunk, paginatedEmbed, pad } from '@pepper/utils';
import tokenProvider from '@pepper/modules/osu/api-oauth2-bearer-token';
import { BeatmapUserScore, GameMode, OsuClient } from '@pepper/lib/osu-v2';

const commandName = 'leaderboard';
const aliases = [commandName, 'ranks'];

export = class extends OsuCommand {
    constructor() {
        super(commandName, {
            aliases,
            description: 'See your ranking compared to other players in this server',
            locked: true,
            args: [{
                id: 'mode',
                match: 'option',
                description: `Gamemode to show. Can be ${modes.map(a => '`' + a + '`').join(', ')}.`,
                flag: ['/']
            }, {
                id: 'map',
                match: 'rest',
                description: `Beatmap URL/ID (specify one to show leaderboard of the map).`
            }],
            cooldown: 3 * 1000
        })
    }

    MEMBER_LIMIT = 50;
    MEMBER_PER_PAGE = 10;

    private randomEarthEmoji() {
        return `earth_` + [`africa`, `americas`, `asia`][Math.round(Math.random() * 2)];
    }

    private markdownWrap = (_ : string) => `\`${_}\``;
    private resolveMapId = (beatmap : string) => {
        let _id = +beatmap;
        if (isNaN(_id)) {
            try { return checkURL(beatmap).id; }
            catch { return null; }
        }
        return _id;
    }

    private async listGuildPlayers(guild : Message['guild'], mode = 'osu') {
        let members = await guild.members.fetch();
        return await Promise.all(
            (await this.client.moduleHandler.findInstance(Users).listUsers(...members.map(_ => _.id)))
                .map(
                    async record => ({
                        userId: record.discordUserId,
                        // we only need user object for user IDs
                        osu: await fetchUser(record.osuUsername, mode)
                    })
                )
        )
    }

    private async guildRanking(m : Message, mode : string) {
        let { guild } = m;
        let members = await guild.members.fetch();
        let records = await this.listGuildPlayers(guild, mode);

        let embeds = chunk(records.sort((a, b) => b.osu.user.statistics.pp - a.osu.user.statistics.pp), this.MEMBER_PER_PAGE)
            .map(chunk => new MessageEmbed()
                .addFields(
                    chunk.map(_user => {
                        let ppStringMaxLength = Math.max(...chunk.map(_ => `${_.osu.user.statistics.pp.toFixed(2)}`.length)),
                            accStringMaxLength = Math.max(...chunk.map(_ => `${(+_.osu.user.statistics.hit_accuracy).toFixed(3)}`.length));
                        let { osu: { user: { username, statistics, country } }, userId } = _user;
                        let { pp, hit_accuracy, global_rank, country_rank } = statistics;
                        return {
                            name: `${username}`,
                            value: `**${
                                pp.toFixed(2).length != ppStringMaxLength
                                    ? this.markdownWrap(pp.toFixed(2).padStart(ppStringMaxLength))
                                    : pp.toFixed(2)
                            }**pp - **${
                                (+hit_accuracy).toFixed(3).length != accStringMaxLength
                                    ? this.markdownWrap((+hit_accuracy).toFixed(3).padStart(accStringMaxLength))
                                    : (+hit_accuracy).toFixed(3)
                            }**%`
                                + ` - :${this.randomEarthEmoji()}: #${global_rank} - :flag_${country.code.toLowerCase()}: #${country_rank}`
                                + `\n${members.get(userId).toString()}`
                        }
                    })
                ))

        if (embeds.length > 1)
            paginatedEmbed()
                .setChannel(m.channel)
                .setEmbeds(embeds.map((embed, i, c) => embed.setFooter(`Page ${i + 1}/${c.length}`)))
                .run({ idle: 20000, dispose: true })
        else
            m.channel.send(
                embeds[0] || new MessageEmbed().setDescription(`No registered users found for this guild.`)
            )
    }

    private async mapRanking(m : Message, set: Beatmapset, scores : BeatmapUserScore[], users : Map<number, [string, string]>) {
        let embeds : MessageEmbed[] = [];
        scores = scores.filter(Boolean);

        if (scores.length) {
            let {
                version, difficulty_rating, ar, cs, accuracy, drain, bpm, id, max_combo, total_length
            } = set.beatmaps.find(map => map.id === scores[0].score.beatmap.id);
            embeds = chunk(
                scores
                .sort((a, b) => {
                    // sort descending
                    if (a.score.pp != b.score.pp) return b.score.pp - a.score.pp;
                    return a.position - b.position;
                }),
                this.MEMBER_PER_PAGE,
            )
            .map(scoreChunk => new MessageEmbed()
                .setTitle(`Scores on ${set.artist} - ${set.title} [${version}]`)
                .setURL(`https://osu.ppy.sh/beatmapsets/${set.id}#${scores[0].score.mode}/${id}`)
                .setDescription(
                    `${difficulty_rating} :star: | `
                    + `**${max_combo}**x | ${pad(2)(Math.floor(total_length / 60))}:${pad(2)(total_length % 60)}`
                    + `\n\`AR\`**${ar}** \`CS\`**${cs}** \`OD\`**${accuracy}** \`HP\`**${drain}** - ${bpm} BPM`
                )
                .addFields(scoreChunk.map(({ score: { user_id, pp, accuracy, max_combo, perfect, score, rank_country, rank_global } }) => ({
                    name: users.get(user_id)[0],
                    value:
                        (pp
                        ? `**${pp}**pp (**${(accuracy * 100).toFixed(3)}**% | **${max_combo}**x)`
                        : `**${(accuracy * 100).toFixed(3)}**% - **${max_combo}**x`)
                        + (perfect ? ' (FC)' : '')
                        + `\n**${new Intl.NumberFormat('en-US').format(score)}** `
                        + `- :${this.randomEarthEmoji()}: #**${rank_global}** - :flag_${users.get(user_id)[1].toLowerCase()}: #**${rank_country}**`
                })))
            );
        }


        if (embeds.length > 1)
            paginatedEmbed()
                .setChannel(m.channel)
                .setEmbeds(embeds.map((embed, i, c) => embed.setFooter(`Page ${i + 1}/${c.length}`)))
                .run({ idle: 20000, dispose: true })
        else
            m.channel.send(
                embeds[0] || new MessageEmbed().setDescription(`No scores found for this guild.`)
            )
    }

    async exec(m : Message, { mode, map } : { mode: string, map: string }) {
        let { guild } = m;

        if (guild.memberCount > this.MEMBER_LIMIT)
            // at this size, I'm not sure if this command works anymore without a cache.
            // it seems to be not really performant to run a $or with 500 conditions
            throw new Error(`This guild is too large - ${guild.memberCount} members, the maximum is set at ${this.MEMBER_LIMIT}`);

        if (!modes.includes(mode)) mode = modes[0];
        if (!map || !this.resolveMapId(map)) return await this.guildRanking(m, mode);

        let mapId = this.resolveMapId(map);
        let client = new OsuClient(this.resolveModule(tokenProvider).token);

        let users = await this.listGuildPlayers(guild, mode);
        let scores = users.map(user =>
            client.Beatmap.score(mapId, user.osu.user.id, { mode: mode as GameMode })
                .then(async score => {
                    score.score = await client.Score.get(score.score.mode, score.score.id);
                    return score;
                })
                .catch(() => null)
        );
        return await this.mapRanking(
            m,
            await fetchMapset(mapId, false),
            await Promise.all(scores),
            new Map(users.map(u => [u.osu.user.id, [u.osu.user.username, u.osu.user.country.code]]))
        );
    }
}
