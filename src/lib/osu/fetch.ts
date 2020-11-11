import axios from 'axios';
import type { Beatmapset } from './beatmapset';
import type { osuUser, osuUserExtra } from './user';
import type { Score } from './score';
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
            + `&offset=${init}&limit=${Math.min(max_single, max_result - init)}`
        );
        if (_.status === 404) throw new Error(`User not found`)
        if (_.status !== 200) throw new Error(
            `Error fetching data : Expected status 200, got status ${_.status}`
        );
        init += max_single;
        out = out.concat(_.data);
        if ((!_.data) || (!_.data.length)) break;
    }
    if (out.length > max_result) out = out.slice(0, max_result);
    return out;
}

export async function fetchRecent(user: number, mode: string, max_result: number, max_single = 50) {
    return fetchScoreset('recent', user, mode, max_result, max_single);
}

export async function fetchBest(user: number, mode: string, max_result: number, max_single = 50) {
    return fetchScoreset('best', user, mode, max_result, max_single);
}

export async function fetchRecentApi(key: string, user : string, mode = 0, limit = 50) {
    const _ = await axios.get(`https://osu.ppy.sh/api/get_user_recent?k=${key}&u=${
        encodeURIComponent(user)
    }&m=${mode}&limit=${limit}`, {
        validateStatus: () => true
    });
    if (_.status === 404) throw new Error(`User not found`)
    if (_.status !== 200) throw new Error(`Expected status 200, got status ${_.status}`);
    return _.data as {
        beatmap_id: string, score: string, maxcombo: string,
        count50: string, count100: string, count300: string,
        countmiss: string, countkatu: string, countgeki: string,
        perfect: string, enabled_mods: string, user_id: string, date: string, rank: string
    }[]
}

export async function fetchScore(id : number, mode : string) {
    const response = await axios.get(`https://osu.ppy.sh/scores/${mode}/${id}`, {
        validateStatus: () => true
    });
    if (response.status === 404) throw new Error(`Score not found`)
    if (response.status !== 200) throw new Error(`Expected status 200, got status ${response.status}`);
    const dom = cheerio.load(response.data);
    return JSON.parse(dom('#json-show').contents().first().text()) as Score;
}