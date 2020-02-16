import { Attribute, AttackRate } from '../../../constants/fgo/'
import { Schema, Document } from 'mongoose'
export interface mstAttriRelation {
    atkAttri: Attribute;
    defAttri: Attribute;
    attackRate: AttackRate;
}

export interface mstAttriRelationDocument extends mstAttriRelation, Document {}

export const mstAttriRelationSchema : Schema<mstAttriRelation> = new Schema({
    atkAttri: Number, defAttri: Number, attackRate: Number
})