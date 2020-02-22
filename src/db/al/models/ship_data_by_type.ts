import { ShipType } from '../../../constants/al';
import { Document, Schema } from 'mongoose'
export interface ship_data_by_type {
    /** Ship type name */
    type_name: string;
    /** Maximum number of occurence in a team ? */
    team_limit: number;
    /** Ship type ID */
    ship_type: ShipType;
    /** Portions of the team that houses this type */
    team_type: 'main' | 'vanguard' | 'submarines'
}

export type _interface = ship_data_by_type;
export const name = 'ship_data_by_type';

export interface doc extends ship_data_by_type, Document {};
export const schema : Schema<doc> = new Schema({
    type_name: String, team_limit: Number, ship_type: Number, team_type: String
})