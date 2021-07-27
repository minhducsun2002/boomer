import { Schema, Document } from 'mongoose';
import { War } from '../../../constants/fgo';
export interface mstWar {
    id: War;
    age: string;
    name: string;
    longName: string;
    coordinates: [[number, number], any[]]
}

export interface mstWarDocument extends Document, mstWar { id: number }

export const mstWarSchema : Schema<mstWarDocument> = new Schema({
    id: Number, age: String, longName: String, name: String, coordinates: [[Number]]
})