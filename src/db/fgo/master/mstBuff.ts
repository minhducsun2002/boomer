import { Schema, Document } from 'mongoose';
import { Trait, Buff } from '@pepper/constants/fgo';
export interface mstBuff {
    vals: Trait[]; tvals: Trait[];
    ckSelfIndv: Trait[];
    ckOpIndv: Trait[];
    id: number; type: Buff;
    detail: string; name: string;
}

export interface mstBuffDocument extends Document, mstBuff { id: number }

export const mstBuffSchema : Schema<mstBuffDocument> = new Schema({
    vals: [Number], tvals: [Number],
    ckSelfIndv: [Number], ckOpIndv: [Number],
    id: Number, type: Number,
    detail: String, name: String
})