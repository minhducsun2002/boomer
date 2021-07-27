import { Schema, Document } from 'mongoose';
import { Item } from '../../../constants/fgo';
export interface mstQuestConsumeItem {
    /** Item used */
    itemIds: Item[];
    /** Consumed count */
    nums: number[];
    questId: number;
}

export interface mstQuestConsumeItemDocument extends Document, mstQuestConsumeItem { id: Item }

export const mstQuestConsumeItemSchema : Schema<mstQuestConsumeItemDocument> = new Schema({
    itemIds: [Number], nums: [Number], questId: Number
})