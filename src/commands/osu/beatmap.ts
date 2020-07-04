import { OsuCommand } from './baseCommand';
import { Message, MessageEmbed } from 'discord.js';
import axios from 'axios';
import cheerio from 'cheerio';
import { SUCCESS_COLOR, ERROR_COLOR } from '../../constants/colors';
import { PagedEmbeds } from '@minhducsun2002/paged-embeds';
import { pad, chunk } from '@pepper/utils';
import { modes, mode_friendly } from '../../constants/osu';
import { embedBeatmap, Beatmap, Beatmapset, embedBeatmapset } from '@pepper/lib/osu';

const commandName = 'beatmap';
const aliases = [commandName, 'map'];

const MAX_DIFF_PER_PAGE = 7;

export default class extends OsuCommand {
    constructor() {
        super(commandName, {
            aliases,
            description: 'Show beatmap(set) info.',
            args: [{
                id: 'beatmap',
                match: 'phrase',
                description: 'Beatmap(set) ID, or URL'
            },{
                id: 'set',
                match: 'flag',
                description: `Force parsing the ID (if an ID is passed) as a set ID, not a map ID`,
                flag: ['/']
            }],
            typing: true
        })
    }

    
    public checkURL (url : string) : { set?: number; id?: number; mode?: string } {
        let valid = !!url.match(/http(?:s)*:\/\/osu\.ppy\.sh\/(b|beatmapsets|beatmaps)\/(\d+)/);
        if (!valid) throw new TypeError(`Not a beatmap(set) URL`);
        let set = +(url.match(/http(?:s)*:\/\/osu\.ppy\.sh\/beatmapsets\/(\d+)/) || []).slice(1)[0];
        let id = +(
            url.match(/http(?:s)*:\/\/osu\.ppy\.sh\/beatmaps\/(\d+)/)
            || url.match(/http(?:s)*:\/\/osu\.ppy\.sh\/b\/(\d+)/)
            || (url.match(/http(?:s)*:\/\/osu\.ppy\.sh\/beatmapsets\/(\d+)#(osu|taiko|fruits|mania)\/(\d+)/) || []).slice(3)
        ).slice(1)[0];
        let [mode] = (url.match(/http(?:s)*:\/\/osu\.ppy\.sh\/beatmapsets\/(\d+)#(osu|taiko|fruits|mania)\/(\d+)/) || []).slice(2)
        return { set, id, mode };
    }

    public async getURL(id : number, set : boolean = false) {
        const _ = await axios.get(
            set ? `https://osu.ppy.sh/beatmapsets/${id}` : `https://osu.ppy.sh/beatmaps/${id}`,
            { validateStatus: () => true }
        );
        if (_.status === 404) throw new Error(`Beatmap not found`);
        if (_.status !== 200) throw new Error(
            `Error getting beatmap : Expected status 200, got status ${_.status}`
        );

        const dom = cheerio.load(_.data);
        return JSON.parse(dom('#json-beatmapset').contents().first().text()) as Beatmapset;
    }

    async exec(m : Message, { beatmap, set } = { beatmap: '', set: false }) {
        const err = new MessageEmbed().setColor(ERROR_COLOR)
            .setDescription(`Sorry, an error occurred.`)
        // check if ID or URL
        let _id = +beatmap, mode = '';
        if (isNaN(_id)) {
            let _ = this.checkURL(beatmap);
            mode = _.mode;
            // base logic :
            // URL overrides everything.
            // if id is available, fetch map, else fetch mapset
            _id = (_.id ? _.id : _.set)
            // /set is enabled if no ID is present, and setId is present
            set = !!_.set && !_.id
            if (!_id) return m.channel.send(err.setDescription(`Sorry, couldn't find such beatmap(set).`))
        }
        try {
            let __ = await this.getURL(_id, set);

            if (set) {
                
                let out = embedBeatmapset(
                    __, MAX_DIFF_PER_PAGE,
                    a => mode ? a.filter(a => a.mode === mode) : a
                )

                new PagedEmbeds()
                    .addHandler('⬅️', (m, i, u, e) => ({ index: (i - 1 + e.length) % e.length }))
                    .addHandler('➡️', (m, i, u, e) => ({ index: (i + 1 + e.length) % e.length }))
                    .setChannel(m.channel)
                    .setEmbeds(out.flat())
                    .run({ idle: 20000, dispose: true })

            } else {
                m.channel.send(
                    embedBeatmap(
                        __.beatmaps.concat(__.converts)
                            .filter(a => a.id === _id)[0],
                        __
                    )
                )
            }
            
        } catch (e) {
            m.channel.send(err.setDescription(`Sorry, an error occurred.`));
        }
    }
}
