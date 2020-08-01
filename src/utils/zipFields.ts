export function zip<T>(arr : T[]) {
    let keys = Object.keys(arr[0]) as (keyof T)[];
    let out = {} as {
        [k in keyof T]: T[k][];
    };
    keys.forEach(k => out[k] = arr.map(t => t[k]));
    return out;
}