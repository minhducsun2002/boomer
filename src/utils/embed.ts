
import { PagedEmbeds } from '@minhducsun2002/paged-embeds';

// embed w/ automatically registered handles
export const paginatedEmbed = () =>
    new PagedEmbeds()
    // .addHandler('⬅️', (m, i, u, e) => ({ index: (i - 1 + e.length) % e.length }))
    // .addHandler('➡️', (m, i, u, e) => ({ index: (i + 1 + e.length) % e.length }))
    .addHandler('⬅️', (i, e) => ({ index: (i - 1 + e.length) % e.length }))
    .addHandler('➡️', (i, e) => ({ index: (i + 1 + e.length) % e.length }))