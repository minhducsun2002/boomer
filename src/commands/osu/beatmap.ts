import { OsuCommand } from './baseCommand';
import { Message, MessageEmbed } from 'discord.js';
import { ERROR_COLOR } from '../../constants/colors';
import { paginatedEmbed } from '@pepper/utils';
import { embedBeatmap, embedBeatmapset, checkURL } from '@pepper/lib/osu';
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
                description: 'Beatmap(set) ID, or URL. Omit to show the last beatmap posted in this channel.'
            },{
                id: 'set',
                match: 'flag',
                description: `Force parsing the ID (if an ID is passed) as a set ID, not a map ID`,
                flag: ['/']
            }],
            typing: true
        })
    }

    private mirrors = process.env.OSU_MIRROR_PATH ? new Map([
        ['My mirror', process.env.OSU_MIRROR_PATH]
    ]) : undefined;

    async exec(m : Message, { beatmap, set } = { beatmap: '', set: false }) {
        let bail = () => m.channel.send(new MessageEmbed().setColor(ERROR_COLOR)
            .setDescription(`Sorry, couldn't find such beatmap(set).`));

        // check if ID or URL
        let _id = +beatmap, mode = '';
        if (isNaN(_id)) {
            let _ = checkURL(beatmap);
            mode = _.mode;
            // base logic :
            // URL overrides everything.
            // if id is available, fetch map, else fetch mapset
            _id = (_.id ? _.id : _.set)
            // /set is enabled in the following cases :
            // - no ID is present, and setId is present
            // - set ID is present, and /set is passed
            set = (!!_.set && !_.id) || (set && !!_.set);
            if (set && !!_.set) _id = _.set;
        }
        if (!_id && !beatmap) _id = this.mapIdCache.getChannelMapId(m.channel.id);
        if (!_id) return bail();

        let __ = await fetchMapset(_id, set);
        this.mapIdCache.setChannelMapId(
            m.channel.id,
            set ? [...__.beatmaps.sort((a, b) => a.difficulty_rating - b.difficulty_rating)].pop().id : _id
        )

        if (set) {
            paginatedEmbed()
                .setChannel(m.channel)
                .setEmbeds(
                    embedBeatmapset(
                        __, MAX_DIFF_PER_PAGE,
                        a => mode ? a.filter(a => a.mode === mode) : a,
                        this.mirrors
                    ).flat()
                )
                .run({ idle: 20000, dispose: true })

        } else {
            m.channel.send(
                await embedBeatmap(
                    __.beatmaps.concat(__.converts)
                        .filter(a => a.id === _id)[0],
                    __,
                    this.mirrors
                )
            )
        }
    }
}
