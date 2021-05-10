export function range(start : number, end : number, step = 1) {
    const _ = function* () {
        let state = start;
        while (state < end) {
            yield state;
            state += step;
        }
        return;
    };
    return [..._()];
};