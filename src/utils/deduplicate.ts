import { Primitive } from 'type-fest';
export function deduplicate<T extends Primitive>(elements: T[]) {
    return [...new Set(elements)];
}