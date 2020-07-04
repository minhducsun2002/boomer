import { OsuCommand } from './baseCommand';
import { Message, MessageEmbed } from 'discord.js';
import axios from 'axios';
import cheerio from 'cheerio';
import { ERROR_COLOR } from '../../constants/colors';
import { paginatedEmbed } from '@pepper/utils';
import { embedBeatmap, Beatmapset, embedBeatmapset } from '@pepper/lib/osu';
import { fetchMapset } from '@pepper/lib/osu';

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

    async exec(m : Message, { beatmap, set } = { beatmap: '', set: false }) {
        const err = new MessageEmbed().setColor(ERROR_COLOR)
            .setDescription(`Sorry, an error occurred.`)
        // check if ID or URL
        let _id = +beatmap, mode = '';
        if (isNaN(_id)) {
            let _e = () : any =>
                m.channel.send(err.setDescription(`Sorry, couldn't find such beatmap(set).`));
            try {
                let _ = this.checkURL(beatmap);
                mode = _.mode;
                // base logic :
                // URL overrides everything.
                // if id is available, fetch map, else fetch mapset
                _id = (_.id ? _.id : _.set)
                // /set is enabled if no ID is present, and setId is present
                set = !!_.set && !_.id
            }
            catch { return _e(); }
            if (!_id) return _e();
        }
        try {
            let __ = await fetchMapset(_id, set);

            if (set) {
                paginatedEmbed()
                    .setChannel(m.channel)
                    .setEmbeds(
                        embedBeatmapset(
                        __, MAX_DIFF_PER_PAGE,
                        a => mode ? a.filter(a => a.mode === mode) : a
                        ).flat()
                    )
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
