import { Schema, Document } from 'mongoose';
import { SkillType } from '@pepper/constants/fgo';
export interface mstSkill {
    id: number;
    name: string, ruby: string;
    maxLv: number;
    type: SkillType;
}

export interface mstSkillDocument extends Document, mstSkill { id: number }

export const mstSkillSchema : Schema<mstSkill> = new Schema({
    id: Number, name: String, ruby: String, maxLv: Number, type: Number
})