import type { Attribute, AttackRate } from '../../../constants/fgo/'
import { Schema, Document } from 'mongoose'
export interface mstAttriRelation {
    atkAttri: typeof Attribute[keyof typeof Attribute];
    defAttri: typeof Attribute[keyof typeof Attribute];
    /** Damage multiplier used.
     * @see https://grandorder.wiki/Attributes
     */
    attackRate: AttackRate;
}

export interface mstAttriRelationDocument extends mstAttriRelation, Document {}

export const mstAttriRelationSchema : Schema<mstAttriRelation> = new Schema({
    atkAttri: Number, defAttri: Number, attackRate: Number
})