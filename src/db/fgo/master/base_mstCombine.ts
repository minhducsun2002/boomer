import { Schema, Document } from 'mongoose';
export interface mstCombine extends Document {
    itemIds: number[]; itemNums: number[];
    id: number, svtLimit: number, qp: number;
}

export const mstCombineSchema = new Schema<mstCombine>({
    itemIds: [Number], itemNums: [Number],
    id: Number, svtLimit: Number, qp: Number
})