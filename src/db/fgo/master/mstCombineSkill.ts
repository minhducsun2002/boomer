import { Schema, Document } from 'mongoose';
export interface mstCombineSkill extends Document {
    itemIds: number[]; itemNums: number[];
    id: number, skillLv: number, qp: number;
}

export const mstCombineSkillSchema = new Schema<mstCombineSkill>({
    itemIds: [Number], itemNums: [Number],
    id: Number, skillLv: Number, qp: Number
})