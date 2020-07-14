import { NA } from '@pepper/db/fgo';

/**
 * Fetch a `mstBuff` by its ID.
 * @param id Buff ID
 */
export async function getBuffById(id: number) {
    let _ = await NA.mstBuff.findOne({ id }).exec();
    if (_ === null) throw new Error(`Could not find any buff with ID ${id}. Is that a trait?`);
    return _;
}