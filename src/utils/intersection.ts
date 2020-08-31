export function findSetIntersection<T>(...sets: Set<T>[]) : Set<T> {
    if (!sets.length) return new Set();
    // check for index 
    // set at which is smallest 
    let leastIndex = sets.reduce((last, curr, i) => curr.size < sets[last].size ? i : last, 0);
    let [base] = sets.splice(leastIndex);
    let out = new Set<T>();
    for (let _ of base) 
        sets.every(s => s.has(_)) ? out.add(_) : 0;
    return out;
}