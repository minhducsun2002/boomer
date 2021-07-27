import { Schema, Document } from 'mongoose';
export interface mstSvtComment {
    svtId: number;
    comment: string;
}

export interface mstSvtCommentDocument extends Document, mstSvtComment { id: number }

export const mstSvtCommentSchema : Schema<mstSvtCommentDocument> = new Schema({
    svtId: Number, comment: String
})