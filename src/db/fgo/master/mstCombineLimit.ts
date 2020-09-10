import { Schema, Document } from 'mongoose';
export interface mstCombineLimit extends Document {
    itemIds: number[]; itemNums: number[];
    id: number, svtLimit: number, qp: number;
}

export const mstCombineLimitSchema = new Schema<mstCombineLimit>({
    itemIds: [Number], itemNums: [Number],
    id: Number, svtLimit: Number, qp: Number
})