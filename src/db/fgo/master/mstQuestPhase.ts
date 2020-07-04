import { Document, Schema } from 'mongoose';
import type { mstClass } from './mstClass'
export interface mstQuestPhase {
    /**
     * Class of enemies that appear in the quest
     */
    classIds: mstClass['id'][];
    individuality: number[];
    questId: number;
    qp: number, playerExp: number, friendshipExp: number;
    phase: number;
}

export interface mstQuestPhaseDocument extends Document, mstQuestPhase { id: number }

export const mstQuestPhaseSchema : Schema<mstQuestPhaseDocument> = new Schema({
    classIds: [Number], individuality: [Number], phase: Number,
    questId: Number, qp: Number, playerExp: Number, friendshipExp: Number
})