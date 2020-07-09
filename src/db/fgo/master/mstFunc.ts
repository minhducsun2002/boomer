import { Schema, Document } from 'mongoose';
import { FuncType, TargetType, ApplyTarget } from '@pepper/constants/fgo';
import type { mstBuff } from './mstBuff';
export interface mstFunc {
    id: number;
    cond: number;
    funcType: FuncType; targetType: TargetType; applyTarget: ApplyTarget;
    popupText: string;
    effectList: mstBuff['id'][];
}

export interface mstFuncDocument extends Document, mstFunc { id: number }

export const mstFuncSchema : Schema<mstFunc> = new Schema({
    id: Number, cond: Number,
    funcType: Number, targetType: Number, applyTarget: Number,
    popupText: String, effectList: [Number]
})