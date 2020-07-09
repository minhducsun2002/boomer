import { Schema, Document } from 'mongoose';
import type { mstSvtTreasureDevice } from './mstSvtTreasureDevice';
import type { mstFunc } from './mstFunc';
type tdId = mstSvtTreasureDevice['treasureDeviceId'];
export interface mstTreasureDeviceLv {
    funcId: mstFunc['id'][];
    svals: [string]; svals2: [string]; svals3: [string]; svals4: [string]; svals5: [string];
    treaureDeviceId: tdId; lv: number; detailId: tdId;
    tdPoint: number, tdPointDef: number,
    tdPointQ: number, tdPointA: number, tdPointB: number, tdPointEx: number;
    qp: number;
}

export interface mstTreasureDeviceLvDocument extends Document, mstTreasureDeviceLv { id: number }

export const mstTreasureDeviceLvSchema : Schema<mstTreasureDeviceLv> = new Schema({
    treasureDeviceId: Number, lv: Number, detailId: Number,
    tdPoint: Number, tdPointDef: Number,
    tdPointQ: Number, tdPointA: Number, tdPointB: Number, tdPointEx: Number,
    qp: Number,
    funcId: [Number],
    svals: [String], svals2: [String], svals3: [String], svals4: [String], svals5: [String]
})