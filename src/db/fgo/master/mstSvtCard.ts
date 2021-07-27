import { Schema, Document } from 'mongoose';
import { DamageDistribution as Damage, CardType } from '../../../constants/fgo'
/**
 * @description
 * `@solution#0286`
 * > - normalDamage = normal
 * - singleDamage = brave chain
 * - grandDamage = buster brave chain
 * - unisonDamage = buster chain (2 servants)
 * - trinityDamage = buster chain (3 servants)
 *
 * `@minhducsun2002`
 * > Servants participating with 1 card is trinity, 2 is unison
 *
 * Kudos to `Cereal` & `solution` for finding out this.
 */
export interface mstSvtCard {
    normalDamage: Damage;
    singleDamage: Damage;
    trinityDamage: Damage;
    unisonDamage: Damage;
    grandDamage: Damage;
    svtId: number;
    cardId: CardType;
}

export interface mstSvtCardDocument extends Document, mstSvtCard {}

const a = [Number]
export const mstSvtCardSchema : Schema<mstSvtCardDocument> = new Schema({
    normalDamage: a, singleDamage: a, trinityDamage: a, unisonDamage: a, grandDamage: a,
    svtId: Number, cardId: Number
})