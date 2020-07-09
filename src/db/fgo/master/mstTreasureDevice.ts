import { Schema, Document } from 'mongoose';
import type { mstSvt } from './mstSvt';
export interface mstTreasureDevice {
    individuality: mstSvt['individuality'];
    name: string; id: number; seqId: number; rank: string; maxLv: number;
    typeText: string; attackAttri: number;
}

export interface mstTreasureDeviceDocument extends Document, mstTreasureDevice { id: number }

export const mstTreasureDeviceSchema : Schema<mstTreasureDevice> = new Schema({
    individuality: [Number], id: Number, seqId: Number,
    rank: String, maxLv: Number, typeText: String, attackAttri: Number
})