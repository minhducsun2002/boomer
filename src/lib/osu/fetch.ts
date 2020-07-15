import axios from 'axios';
import type { Beatmapset } from './beatmapset';
import type { osuUser, osuUserExtra } from './user';
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

/**
 * Fetch an user's record.
 * @param user Username to fetch.
 * @param mode Gamemode to fetch. Should be one of `osu`, `taiko`, `fruits`, `mania`
 */
export async function fetchUser(user : string, mode : string) {
    const _ = await axios.get(`https://osu.ppy.sh/u/${encodeURIComponent(user)}/${mode}`, {
        validateStatus: () => true
    });
    if (_.status === 404) throw new Error(`User not found`)
    if (_.status !== 200) throw new Error(`Expected status 200, got status ${_.status}`);
    const dom = cheerio.load(_.data);
    return {
        user: JSON.parse(dom('#json-user').contents().first().text()) as osuUser,
        extra: JSON.parse(dom('#json-extras').contents().first().text()) as osuUserExtra
    };
}

async function fetchScoreset(path : string, user: number, mode: string, max_result: number, max_single = 50) {
    let init = 0, out : osuUserExtra['scoresBest'] = [];
    while (init < max_result) {
        let _ = await axios.get(
            `https://osu.ppy.sh/users/${user}/scores/${path}?mode=${mode}`
            + `&offset=${init}&limit=${max_single}`
        );
        if (_.status === 404) throw new Error(`User not found`)
        if (_.status !== 200) throw new Error(
            `Error fetching data : Expected status 200, got status ${_.status}`
        );
        init += max_single;
        out = out.concat(_.data);
        if ((!_.data) || (!_.data.length)) break;
    }
    return out;
}

export async function fetchRecent(user: number, mode: string, max_result: number, max_single = 50) {
    return fetchScoreset('recent', user, mode, max_result, max_single);
}

export async function fetchBest(user: number, mode: string, max_result: number, max_single = 50) {
    return fetchScoreset('best', user, mode, max_result, max_single);
}