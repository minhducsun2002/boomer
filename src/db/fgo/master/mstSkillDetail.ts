import { Schema, Document } from 'mongoose';
export interface mstSkillDetail {
    id: number;
    detail: string;
    detailShort: string;
}

export interface mstSkillDetailDocument extends Document, mstSkillDetail { id: number }

export const mstSkillDetailSchema : Schema<mstSkillDetail> = new Schema({
    id: Number, detail: String, detailShort: String
})