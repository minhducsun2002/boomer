import { Schema, Document } from 'mongoose';
import type { mstSvt } from './mstSvt'
export interface mstSvtLimit {
    svtId:  mstSvt['id'];
    weaponColor: number;
    rarity: number;
    lvMax: number;
    criticalWeight: number;
    // stats
    power: number; defense: number; agility: number;
    magic: number; luck: number; treasureDevice: number;

    hpBase: number; hpMax: number;
    atkBase: number; atkMax: number;
}

export interface mstSvtLimitDocument extends Document, mstSvtLimit { id: number }

export const mstSvtLimitSchema : Schema<mstSvtLimitDocument> = new Schema({
    svtId: Number, weaponColor: Number,
    rarity: Number, lvMax: Number, criticalWeight: Number,

    power: Number, defense: Number, agility: Number,
    magic: Number, luck: Number, treasureDevice: Number,

    hpBase: Number, hpMax: Number, atkBase: Number, atkMax: Number
})