interface _ { [i: string]: any }
export function truthify (a: _) {
    for (let key in a) if (!a[key]) delete a[key];
}