export function checkURL (url : string) : { set?: number; id?: number; mode?: string } {
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