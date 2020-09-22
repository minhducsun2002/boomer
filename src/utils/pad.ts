/**
 * Generate a function to pad numbers with 0s to a certain length
 * Will not do anything if the number is already long enough
 * @param n Length to pad for
 */
export function pad (n: number) {
    return (m: number) => `0`.repeat((n - `${m}`.length) > 0 ? n - `${m}`.length : 0) + `${m}`;
}