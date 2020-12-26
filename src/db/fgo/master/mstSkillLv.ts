import { Schema, Document } from 'mongoose';
import type { mstFunc } from './mstFunc';
import type { mstSkill } from './mstSkill';
export interface mstSkillLv {
    funcId: mstFunc['id'][];
    svals: string[];
    skillId: mstSkill['id'];
    lv: number; chargeTurn: number;
}

export interface mstSkillLvDocument extends Document, mstSkillLv {}

export const mstSkillLvSchema : Schema<mstSkillLv> = new Schema({
    funcId: [Number], svals: [String], skillId: Number,
    lv: Number, chargeTurn: Number
})