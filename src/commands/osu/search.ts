import { OsuCommand } from './baseCommand';
import { Message, MessageEmbed } from 'discord.js';
import axios from 'axios';
import { modes, mode_friendly, status } from '../../constants/osu';
import { SUCCESS_COLOR, ERROR_COLOR } from '../..//constants/colors';
import { chunk, paginatedEmbed } from '@pepper/utils';

const commandName = 'search';
const aliases = [commandName];

interface bloodcatBeatmap {
    id: string;
    ar: string, hp: string, cs: string, od: string;
    bpm: string; mode: string; name: string; star: string;
    length: string; hash_md5: string;
}

interface bloodcatBeatmapSet {
    artist: string; artistU : string | null;
    beatmaps: bloodcatBeatmap[]; creator: string; creatorId: string;
    id: string; rankedAt: string; status: string; tags: string;
    title: string; titleU: string | null;
}

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
                flag: ['/'],
                multipleFlags: true
            }]
        })
    }

    async exec(m : Message, { query, mode: _m } : { query: string, mode: string[] }) {
        const max_page = 3, max_diff = 10;
        const err = new MessageEmbed().setColor(ERROR_COLOR)
            .setDescription(`Sorry, an error occurred.`);

        _m = _m.filter(a => modes.includes(a));
        if (!query)
            return m.channel.send(err.setDescription(`Please provide a search term.`));
        try {
            let url = `https://bloodcat.com/osu/?mod=json&q=${query}&c=b&s=1,2,3,4&m=${
                _m.map(a => modes.indexOf(a)).join(',')
            }&p=1`;
            const _ = await axios.get(url, { validateStatus: () => true });
            if (_.status !== 200) throw new Error(
                `Error getting beatmap : Expected status 200, got status ${_.status}`
            );
            let resp = _.data as bloodcatBeatmapSet[];
            let out = chunk(resp, max_page).map((o, i, _) => new MessageEmbed()
                .setTimestamp().setColor(SUCCESS_COLOR)
                .setAuthor(`bloodcat.com/osu`, null, `https://bloodcat.com/osu`)
                .setTitle(`Search results for \`${query}\``)
                .setDescription(
                    (_m.length ? `Game mode : ${
                        _m.map(a => mode_friendly[modes.indexOf(a)]).join(' | ')
                    }\n` : '\n')
                    + `Status : ranked / approved / qualified / loved`
                )
                .addFields(
                    o.map(a => ({
                        name: `[${status[+a.status]}] ${a.artistU || a.artist} - ${a.titleU || a.title}`,
                        value: a.beatmaps.slice(0, max_diff)
                            .sort((a, b) => (+a.star - +b.star))
                            // .map(({ id, ar, hp, cs, od, star, name, mode, length }) =>
                            .map(({ id, star, name, mode }) =>
                                // `mapped by [${a.creator}](https://osu.ppy.sh/users/${a.creatorId})`
                                `[${mode_friendly[+mode]}] `
                                + `[__**${name}**__](https://osu.ppy.sh/beatmaps/${id})`
                                + ` (**${(+star).toFixed(2)}**:star:)`
                                // + `| ${pad(2)(Math.floor(+length / 60))}:${pad(2)(+length % 60)} `
                                // + `|\`AR\`**${ar}** \`CS\`**${cs}** \`OD\`**${od}** \`HP\`**${hp}**`
                            )
                            .join('\n')
                    }))
                )
                .setFooter(_.length > 1 ? `Page ${i + 1}/${_.length}` : ''));
            if (out.length === 0)
                return m.channel.send(
                    err.setDescription('Sorry, I found nothing that matched your query.')
                )
            if (out.length === 1)
                return m.channel.send(out[0]);
            if (out.length >= 2)
                paginatedEmbed()
                .setEmbeds(out)
                .setChannel(m.channel)
                .run({ idle: 20000, dispose: true })
        } catch (e) {
            m.channel.send(err.setDescription(
                `Sorry, an error occurred trying to load data.\n`
                + '```' + e + '```'
            ))
        }
    }
}
