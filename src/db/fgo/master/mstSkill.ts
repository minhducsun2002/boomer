import { Schema, Document } from 'mongoose';
import { SkillType, Trait } from '@pepper/constants/fgo';
export interface mstSkill {
    id: number;
    actIndividuality: Trait[];
    name: string, ruby: string;
    maxLv: number;
    type: SkillType;
}

export interface mstSkillDocument extends Document, mstSkill { id: number }

export const mstSkillSchema : Schema<mstSkillDocument> = new Schema({
    id: Number, actIndividuality: [Number], name: String, ruby: String, maxLv: Number, type: Number
})