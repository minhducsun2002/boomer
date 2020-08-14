export function zip<T>(arr : T[]) {
    let keys = Object.keys(arr[0]) as (keyof T)[];
    let out = {} as {
        [k in keyof T]: T[k][];
    };
    keys.forEach(k => out[k] = arr.map(t => t[k]));
    return out;
}

export function zipMap<T, K>(maps : Map<T, K>[]) {
    let keys = maps.map(m => [...m.keys()]).flat(Infinity) as T[];
    let out = new Map<T, K[]>();
    keys.forEach(key => out.set(key, maps.map(m => m.get(key))));
    return out;
}