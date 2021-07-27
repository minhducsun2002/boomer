import { Schema, Document } from 'mongoose';
import { War } from '../../../constants/fgo'
export interface mstSpot {
    id: number;
    warId: War;
    name: string;
    /** coordinates */
    x: number; y: number;
}

export interface mstSpotDocument extends Document, mstSpot { id: number }

export const mstSpotSchema : Schema<mstSpotDocument> = new Schema({
    id: Number,
    warId: Number,
    name: String,
    x: Number, y: Number
})