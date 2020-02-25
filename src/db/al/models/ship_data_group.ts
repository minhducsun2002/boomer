import { Document, Schema } from 'mongoose';
import { Group, code } from '../../../constants/al'
export interface ship_data_group {
    group_type: Group;
    code: code;
    /** Where to obtain this ship. */
    description: [string][];
}

export type _interface = ship_data_group;
export const name = 'ship_data_group';

export interface doc extends ship_data_group, Document {};
export const schema : Schema<doc> = new Schema({
    group_type: Number, code: Number, description: Schema.Types.Mixed
})