import { Schema, Document } from 'mongoose';
export interface mstSvtSkill {
    skillId: number;
    /** MLB CEs? */
    condLimitCount: number;
    /** servant ID in `mstSvt` */
    svtId: number;
    /** Position in the servant listing */
    num: number;
    /** Priority (upon rank-ups completion, higher priority overwrites lower) */
    priority: number;
}

export interface mstSvtSkillDocument extends Document, mstSvtSkill { id: number }

export const mstSvtSkillSchema : Schema<mstSvtSkillDocument> = new Schema({
    svtId: Number, skillId: Number, condLimitCount: Number,
    num: Number, priority: Number
})