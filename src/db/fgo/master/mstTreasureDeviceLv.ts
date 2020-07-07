import { Schema, Document } from 'mongoose';
import type { mstSvtTreasureDevice } from './mstSvtTreasureDevice'
type tdId = mstSvtTreasureDevice['treasureDeviceId'];
export interface mstTreasureDeviceLv {
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
    qp: Number
})