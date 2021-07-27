import { Schema, Document } from 'mongoose';
import { ClassType, Attribute, AttackRate, Trait } from '../../../constants/fgo';
export interface mstClass {
    id: ClassType;
    attri: typeof Attribute[keyof typeof Attribute] | Trait;
    name: string;
    attackRate: AttackRate;
}

export interface mstClassDocument extends Document, mstClass { id: ClassType }

export const mstClassSchema : Schema<mstClassDocument> = new Schema({
    id: Number,
    attri: Number,
    name: String,
    attackRate: Number
})