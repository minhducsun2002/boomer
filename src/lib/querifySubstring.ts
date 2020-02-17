import esc from 'escape-string-regexp';
export default (s: string) => ({ $regex: s ? esc(s.toString()).replace(/\s/i, " ") : '', $options: 'i' })