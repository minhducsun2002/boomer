import { Schema, Document } from 'mongoose'
import { Group, Level, ShipType } from '../../../constants/al';
export interface ship_data_template {
    /** Ship name */
    name: string;
    /** Max level for this record */
    max_level: Level;
    /** Ship type */
    type: ShipType;
    /** Group */
    group_type: Group;
    /** ID of this record */
    id: number;
}

export interface doc extends ship_data_template, Document { id: number };

export const name = 'ship_data_template';
export type _interface = ship_data_template
export const schema : Schema<doc> = new Schema({
    name: String, max_level: Number, type: Number, group_type: Number
})