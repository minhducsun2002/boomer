import { Schema, Document } from 'mongoose';
export interface mstSvtSkill {
    skillId: number;
    /** MLB CEs? */
    condLimitCount: number;
    /** servant ID in `mstSvt` */
    svtId: number
}

export interface mstSvtSkillDocument extends Document, mstSvtSkill { id: number }

export const mstSvtSkillSchema : Schema<mstSvtSkill> = new Schema({
    svtId: Number, skillId: Number, condLimitCount: Number
})