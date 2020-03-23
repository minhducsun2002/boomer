import { OsuCommand } from './baseCommand';
import { Message, MessageEmbed } from 'discord.js';
import axios from 'axios';
import cheerio from 'cheerio';
import { SUCCESS_COLOR, ERROR_COLOR } from '../../constants/colors';
import type { osuUser, osuUserExtra } from './user';
import { PagedEmbeds } from '@minhducsun2002/paged-embeds';
import { chunk } from '../../lib/chunk';
import { log } from '../../lib/logger';

const commandName = 'recent';
const aliases = [commandName, 'recentplay', 'rp'];

const modes = ['osu', 'taiko', 'fruits', 'mania'];
const MAX_RESULTS = 100, MAX_SINGLE = 50, MAX_VIEW = 5;

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
            }],
            cooldown: 3 * 1000
            // 3s
        })
    }

    async exec(m : Message, { user, mode } = { user: '', mode: '' }) {
        user = user.trim();
        if (!modes.includes(mode)) mode = modes[0];
        // check mode
        const err = new MessageEmbed().setColor(ERROR_COLOR)
            .setDescription(`Sorry, couldn't find anyone with username \`${user}\`.`)
        try {
            const _ = await axios.get(`https://osu.ppy.sh/u/${encodeURIComponent(user)}/${mode}`, {
                validateStatus: () => true
            });
            if (_.status === 404) return m.channel.send(err);
            if (_.status !== 200) throw new Error(
                `Error getting user ID : Expected status 200, got status ${_.status}`
            );

            const dom = cheerio.load(_.data);
            let { id, username } : osuUser = JSON.parse(dom('#json-user').contents().first().text());
            // we got the ID, now we start fetching things

            let initial = 0, recents : osuUserExtra['scoresBest'] = []
            while (initial < MAX_RESULTS) {
                let _ = await axios.get(`https://osu.ppy.sh/users/${
                    encodeURIComponent(id)
                }/scores/recent?mode=${mode}&offset=${encodeURIComponent(initial)}&limit=${encodeURIComponent(MAX_SINGLE)}`);
                if (_.status === 404) return m.channel.send(err);
                if (_.status !== 200) throw new Error(
                    `Error fetching data : Expected status 200, got status ${_.status}`
                );
                initial += MAX_SINGLE;
                // default axios behavior is parsing applications/json?
                
                // let ___ = JSON.parse(_.data);
                let ___ : typeof recents = _.data;
                recents = recents.concat(___);
                if (!___.length)
                    // if no data, we cannot fetch further
                    break;
            }
            
            if (recents.length) 
                new PagedEmbeds()
                    .setChannel(m.channel)
                    .setEmbeds(
                        chunk(recents, MAX_VIEW)
                            .map((s, i, c) => {
                                let out = new MessageEmbed()
                                    .setTitle(`Recent plays of **${username}**`)
                                    .setURL(`https://osu.ppy.sh/users/${id}`)
                                    .setColor(SUCCESS_COLOR)
                                    .setFooter(`Page ${i + 1}/${c.length}`)
                                s.forEach(({ accuracy, mods, perfect, rank, max_combo, beatmap, beatmapset, pp }) => out.addField(
                                    `${beatmapset.artist} - ${beatmapset.title} [${beatmap.version}]`
                                    + (mods.length ? `+${mods.join('')}` : ''),
                                    `[**${rank}**] ${
                                        // multiple formatting
                                        pp
                                        ? `**${pp}**pp (**${(accuracy * 100).toFixed(3)}**% | **${max_combo}**x)`
                                        : `**${(accuracy * 100).toFixed(3)}**% - **${max_combo}**x`
                                    }`
                                        + (perfect ? ` (FC)` : '')
                                    + `\n[Link](https://osu.ppy.sh/beatmaps/${beatmap.id}) ([download](https://osu.ppy.sh/beatmaps/${beatmap.id}/download))`
                                ))
                                return out;
                            })
                    )
                    .addHandler('⬅️', (m, i, u, e) => ({ index: (i - 1 + e.length) % e.length }))
                    .addHandler('➡️', (m, i, u, e) => ({ index: (i + 1 + e.length) % e.length }))
                    .run({ idle: 20000, dispose: true })
            else
                m.channel.send(
                    new MessageEmbed()
                        .setDescription(`No recent play found for user [**${username}**](https://osu.ppy.sh/users/${id}).`)
                )
        }
        catch (e) {
            log.error(String(e));
            m.channel.send(err.setDescription(`Sorry, an error occurred.`));
        }
    }
}