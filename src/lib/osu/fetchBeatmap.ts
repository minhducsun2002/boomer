import axios from 'axios';
import type { Beatmapset } from './beatmapset';
import cheerio from 'cheerio';
/**
 * Fetch data of a certain beatmapset, given its ID
 * or one of its difficulty ID.
 * @param id Map(set) ID.
 * @param set Whether this is a set ID or a map ID.
 */
export async function fetchMapset(id : number, set : boolean = false) {
    const _ = await axios.get(
        set
        ? `https://osu.ppy.sh/beatmapsets/${id}`
        : `https://osu.ppy.sh/beatmaps/${id}`,
        { validateStatus: () => true }
    );
    if (_.status === 404) throw new Error(`Beatmap not found`);
    if (_.status !== 200) throw new Error(
        `Error getting beatmap : Expected status 200, got status ${_.status}`
    );

    const dom = cheerio.load(_.data);
    return JSON.parse(dom('#json-beatmapset').contents().first().text()) as Beatmapset;
}