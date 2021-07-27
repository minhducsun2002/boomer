import { Schema, Document } from 'mongoose';
import { CardType } from '@pepper/constants/fgo'
import type { mstSvt } from './mstSvt'
export interface mstSvtTreasureDevice {
    svtId: mstSvt['id']; num: number;
    condLv: number; condFriendshipRank: number;
    treasureDeviceId: number;
    priority: number;
    condQuestId: number; cardId: CardType;
    damage: number[];
}

export interface mstSvtTreasureDeviceDocument extends Document, mstSvtTreasureDevice { id: number }

export const mstSvtTreasureDeviceSchema : Schema<mstSvtTreasureDeviceDocument> = new Schema({
    svtId: Number, condLv: Number, condFriendshipRank: Number,
    treasureDeviceId: Number, priority: Number, condQuestId: Number,
    cardId: Number, damage: [Number], num: Number
})