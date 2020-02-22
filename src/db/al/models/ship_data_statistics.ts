import { Schema, Document } from 'mongoose'
import { Armor, Proficiency } from '../../../constants/al';
export interface ship_data_statistics {
    /** Ship name */
    name: string;
    /** `${prefix}${name}` */
    english_name: string;
    /** Armour type */
    armor_type: Armor;
    /** (Minimum?) proficiency for equipments */
    equipment_proficiency: [Proficiency, Proficiency, Proficiency];
    /** Tags */
    tag_list: string[];
    /** ID of this record */
    id: number;
    /** Base ID of this ship. Maybe ID for the default skin? */
    skin_id: number;
}

export interface doc extends ship_data_statistics, Document { id: number };

export const name = 'ship_data_statistics';
export type _interface = ship_data_statistics
export const schema : Schema<doc> = new Schema({
    name: String,
    english_name: String,
    armor_type: Number,
    equipment_proficiency: [Number],
    tag_list: [String],
    id: Number, skin_id: Number
})