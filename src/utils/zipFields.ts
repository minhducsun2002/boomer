/**
 * Zip an array of objects into an object with the same keys (taken from the 1st object),
 * but each key maps to an array of values taken from the respective keys of those objects.
 * @param arr Array of objects 
 */
export function zip<T>(arr : T[]) {
    let keys = Object.keys(arr[0]) as (keyof T)[];
    let out = {} as {
        [k in keyof T]: T[k][];
    };
    keys.forEach(k => out[k] = arr.map(t => t[k]));
    return out;
}

/**
 * Zip an array of maps into a map with keys taken from all maps.
 * Each key maps to an array of values taken from the respective keys of those maps.
 * @param arr Array of objects 
 */
export function zipMap<T, K>(maps : Map<T, K>[]) {
    let keys = maps.map(m => [...m.keys()]).flat(Infinity) as T[];
    let out = new Map<T, K[]>();
    keys.forEach(key => out.set(key, maps.map(m => m.get(key))));
    return out;
}