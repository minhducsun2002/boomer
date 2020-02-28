import { Schema, Document } from 'mongoose';
export interface mstSvtComment {
    svtId: number;
    comment: string;
}

export interface mstSvtCommentDocument extends Document, mstSvtComment { id: number }

export const mstSvtCommentSchema : Schema<mstSvtComment> = new Schema({
    svtId: Number, comment: String
})