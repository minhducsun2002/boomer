import { Document, Schema } from 'mongoose'
export interface gametip {
    /** original key */
    id: string;
    tip: string;
    key: string;
}

export type _interface = gametip;
export const name = 'gametip';

export interface doc extends gametip, Document { id: string };
export const schema : Schema<doc> = new Schema({
    id: String, tip: String, key: String
})