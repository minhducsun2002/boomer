import { Schema, Document } from 'mongoose';
import { FuncType, TargetType, ApplyTarget, Trait } from '@pepper/constants/fgo';
import type { mstBuff } from './mstBuff';
export interface mstFunc {
    id: number;
    cond: number;
    funcType: FuncType; targetType: TargetType; applyTarget: ApplyTarget;
    popupText: string;
    vals: mstBuff['id'][]; tvals: Trait[]; questTvals: (Trait | number)[];
}

export interface mstFuncDocument extends Document, mstFunc { id: number }

export const mstFuncSchema : Schema<mstFunc> = new Schema({
    id: Number, cond: Number,
    funcType: Number, targetType: Number, applyTarget: Number,
    popupText: String, vals: [Number], tvals: [Number], questTvals: [Number]
})