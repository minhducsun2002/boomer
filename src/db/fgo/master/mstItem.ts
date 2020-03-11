import { Schema, Document } from 'mongoose';
import { Item } from '../../../constants/fgo';
export interface mstItem {
    id: Item;
    /** Item name */
    name: string;
    /** Item desc */
    detail: string;
    /** self-explanatory? */
    sellQp: number;
    /** timestamps */
    startedAt: number; endedAt: number;
}

export interface mstItemDocument extends Document, mstItem { id: Item }

export const mstItemSchema : Schema<mstItem> = new Schema({
    id: Number, sellQp: Number, name: String, detail: String, startedAt: Number, endedAt: Number
})