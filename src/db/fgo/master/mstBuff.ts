import { Schema, Document } from 'mongoose';
import { Trait, Buff } from '@pepper/constants/fgo';
export interface mstBuff {
    vals: Trait[]; tvals: Trait[];
    ckSelfIndv: Trait[];
    id: number; type: Buff;
    detail: string; name: string
}

export interface mstBuffDocument extends Document, mstBuff { id: number }

export const mstBuffSchema : Schema<mstBuff> = new Schema({
    vals: [Number], tvals: [Number],
    ckSelfIndv: [Number], id: Number, type: Number,
    detail: String, name: String
})