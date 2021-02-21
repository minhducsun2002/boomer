import { OsuCommand } from './baseCommand';
import { Message, MessageEmbed } from 'discord.js';
import axios from 'axios';
import { modes, mode_friendly } from '../../constants/osu';
import { SUCCESS_COLOR, ERROR_COLOR } from '../..//constants/colors';
import { chunk, paginatedEmbed } from '@pepper/utils';
import tokenProvider from '@pepper/modules/osu/api-oauth2-bearer-token';
import { Beatmapset } from '@pepper/lib/osu';

const commandName = 'search';
const aliases = [commandName];
const osuIconUrl = `https://github.com/ppy/osu/raw/23419a0ec3f15d821d33e041f536236951adebd3/assets/lazer.png`;

export = class extends OsuCommand {
    constructor() {
        super(commandName, {
            aliases,
            description: 'Search a beatmap using bloodcat.com mirror.',
            args: [{
                id: 'query',
                match: 'rest',
                description: 'Search term'
            }, {
                id: 'mode',
                match: 'option',
                description: `Gamemode to search. Can be ${modes.map(a => '`' + a + '`').join('/')}.`,
                flag: ['/']
            }]
        })
    }

    async exec(m : Message, { query, mode: _m } : { query: string, mode: string }) {
        const max_per_page = 3, max_diff_per_set = 10;
        const bail = (s : string) => m.channel.send(
            new MessageEmbed().setColor(ERROR_COLOR)
                .setDescription(s || `Sorry, an error occurred.`)
        );

        if (!query) return bail(`Please provide a search term.`);

        let { token } = this.client.moduleHandler.findInstance(tokenProvider);
        if (!token) return bail(`There seems to be no osu!api access token. Contact my owner on this matter.`);

        try {
            let url = `https://osu.ppy.sh/api/v2/beatmapsets/search?q=${encodeURIComponent(query)}${
                modes.includes(_m) ? `&m=${modes.indexOf(_m)}` : ''
            }`;
            let rawResponse = await axios.get(url, {
                validateStatus: () => true,
                headers: {
                    'Authorization' : `Bearer ${token}`
                }
            });
            let data = rawResponse.data.beatmapsets as Beatmapset[];

            let out = chunk(data, max_per_page).map((_chunk, index, _) => new MessageEmbed()
                .setColor(SUCCESS_COLOR)
                .setAuthor(`Beatmap search`, osuIconUrl, `https://osu.ppy.sh/beatmapsets`)
                .setTitle(`Search results for \`${query}\``)
                .setDescription(
                    (modes.includes(_m) ? `Game mode : ${mode_friendly[modes.indexOf(_m)]}\n` : '')
                    + `Status : has leaderboard`
                )
                .addFields(
                    _chunk.map(set => ({
                        name: `[${set.status.charAt(0).toUpperCase() + set.status.substr(1)}] `
                            + `${set.artist_unicode || set.artist} - ${set.title_unicode || set.title}`,
                        value: set.beatmaps.slice(0, max_diff_per_set)
                            .sort((a, b) => (+a.difficulty_rating - +b.difficulty_rating))
                            .map(({ id, difficulty_rating, version, mode_int }) =>
                                `[${mode_friendly[mode_int]}] `
                                + `[__**${version}**__](https://osu.ppy.sh/beatmaps/${id})`
                                + ` (**${difficulty_rating.toFixed(2)}**:star:)`
                            )
                            .join('\n')
                    }))
                )
                .setFooter(_.length > 1 ? `Page ${index + 1}/${_.length}` : '')
            );

            if (out.length === 0)
                return bail('Sorry, I found nothing that matched your query.');
            if (out.length === 1)
                return m.channel.send(out[0]);
            if (out.length >= 2)
                paginatedEmbed()
                .setEmbeds(out)
                .setChannel(m.channel)
                .run({ idle: 20000, dispose: true })
        } catch (e) {
            bail(`Sorry, an error occurred trying to load data.\n` + '```' + e + '```')
        }
    }
}
