export const plural = (a : number) => a <= 1 ? '' : 's';
export const plural_wrap = (a : number, word = '') => word + plural(a);