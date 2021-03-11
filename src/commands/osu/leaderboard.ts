import { OsuCommand } from './baseCommand';
import { Message, MessageEmbed } from 'discord.js';
import { fetchUser } from '@pepper/lib/osu/fetch';
import { modes } from '@pepper/constants/osu';
import Users from '@pepper/modules/osu/username-db';
import { chunk } from '@pepper/utils';
import { paginatedEmbed } from '@pepper/utils';

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
            }]
        })
    }

    MEMBER_LIMIT = 50;
    MEMBER_PER_PAGE = 10;

    private randomEarthEmoji() {
        return `earth_` + [`africa`, `americas`, `asia`][Math.round(Math.random() * 2)];
    }

    private markdownWrap = (_ : string) => `\`${_}\``;

    async exec(m : Message, { mode } : { mode: string }) {
        let { guild } = m;
        if (!modes.includes(mode)) mode = modes[0];

        if (guild.memberCount > this.MEMBER_LIMIT)
            // at this size, I'm not sure if how this command works anymore without a cache.
            // it seems to be not really performant to run a $or with 2000 conditions
            throw new Error(`This guild is too large - ${guild.memberCount} members, the maximum is set at ${this.MEMBER_LIMIT}`);

        let members = await guild.members.fetch();
        let records = await Promise.all(
            (await this.client.moduleHandler.findInstance(Users).listUsers(...members.map(_ => _.id)))
                .map(
                    async record => ({
                        userId: record.discordUserId,
                        osu: await fetchUser(record.osuUsername, mode)
                    })
                )
        );

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
}
