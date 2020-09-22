import { PagedEmbeds } from '@minhducsun2002/paged-embeds';

/**
 * Create a paginated embed with page-scrolling actions pre-registered.
 */
export function paginatedEmbed() {
    return new PagedEmbeds()
    .addHandler('⬅️', (i, e) => ({ index: (i - 1 + e.length) % e.length }))
    .addHandler('➡️', (i, e) => ({ index: (i + 1 + e.length) % e.length }))
}