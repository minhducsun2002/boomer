import { Schema, Document } from 'mongoose';
import { SvtType, GenderType, CardType, ClassType, Attribute, Level, Trait } from '@pepper/constants/fgo';
import type { mstSkill } from './mstSkill';

export interface mstSvt {
    name: string;
    /**
     * @see https://en.wikipedia.org/wiki/Ruby_character
     */
    ruby: string;
    /** Name displayed in battle i.e. `Maid Alter` for (Rider) `Altria Pendragon (Alter)` */
    battleName: string;
    /** In game cost of this object */
    cost: number;
    type: SvtType;
    /** Mana Prisms you get for selling this */
    sellMana: number;
    /** Rare Prisms you get for selling this */
    sellRarePri: number;
    /** QP you get for selling this */
    sellQp: number
    /** The ID you see in game */
    collectionNo: number;
    /** Card set */
    cardIds: CardType[];
    /** Gender */
    genderType: GenderType;
    /** Servant internal ID */
    id: number;
    /** Not sure why it is similar to {@link mstSvt.id} */
    baseSvtId: number;
    /** Quests related to this object */
    relateQuestIds: number[];
    /** Star generation weight (i.e. 100 for Altria, meaning 10%) */
    starRate: number;
    /** Maximum level */
    rewardLv: Level;
    /** Class */
    classId: ClassType;
    /** Attribute */
    attri: typeof Attribute[keyof typeof Attribute];
    /** Traits */
    individuality: Trait[];
    /** Passive skill IDs */
    classPassive: mstSkill['id'][];
}

export interface mstSvtDocument extends mstSvt, Document { id: number; }

export const mstSvtSchema : Schema<mstSvt> = new Schema({
    name: String,
    ruby: String,
    battleName: String,
    cost: Number,
    type: Number,
    sellMana: Number,
    sellRarePri: Number,
    sellQp: Number,
    collectionNo: Number,
    cardIds: [Number],
    genderType: Number,
    id: Number, baseSvtId: Number,
    relateQuestIds: [Number],
    starRate: Number,
    rewardLv: Number,
    classId: Number,
    attri: Number,
    individuality: [Number],
    classPassive: [Number]
})