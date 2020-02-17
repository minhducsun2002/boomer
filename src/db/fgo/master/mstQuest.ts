import { Document, Schema } from 'mongoose';

import { AP, Level, Chapter, Spot } from '../../../constants/fgo'
export interface mstQuest {
    actConsume: AP;
    recommendLv: Level;
    id: number;
    name: string;
    chapterId: Chapter;
    noticeAt: number; openedAt: number; closedAt: number;
    spotId: Spot;
}

export interface mstQuestDocument extends Document, mstQuest { id: number }

export const mstQuestSchema : Schema<mstQuest> = new Schema({
    actConsume: Number,
    recommendLv: Number,
    id: Number,
    name: String,
    chapterId: Number,
    noticeAt: Number, openedAt: Number, closedAt: Number,
    spotId: Number
})