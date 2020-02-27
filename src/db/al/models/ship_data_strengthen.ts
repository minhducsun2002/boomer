import { Group } from '../../../constants/al';
import { Document, Schema } from 'mongoose'
export interface ship_data_strengthen {
    /** enhancement for this ship */
    id: Group;
    /** enhancements */
    level_exp: []
}

export type _interface = ship_data_strengthen;
export const name = 'ship_data_strengthen';

export interface doc extends ship_data_strengthen, Document { id: Group };
export const schema : Schema<doc> = new Schema({
    id: Number, level_exp: [Number]
})