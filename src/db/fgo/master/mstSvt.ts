import { Schema, Document } from 'mongoose';

/** Object type */
export enum SvtType {
    NORMAL = 1,
    /** Only Mash gets to have Heroine type, I guess */
    HEROINE,
    COMBINE_MATERIAL,
    ENEMY,
    ENEMY_COLLECTION,
    SERVANT_EQUIP,
    STATUS_UP,
    SVT_EQUIP_MATERIAL,
    ENEMY_COLLECTION_DETAIL,
    ALL,
    COMMAND_CODE
}

/** Card type */
export enum CardType { ARTS = 1, BUSTER = 2, QUICK = 3 };
/** Gender type */
export enum GenderType { Male = 1, Female = 2 }

/** Servant class type */
export enum ClassType {
    Saber = 1,
    Archer = 2,
    Lancer = 3,
    Rider = 4,
    Caster = 5,
    Assassin = 6,
    Berserker = 7,
    Shielder = 8,
    Ruler = 9,
    AlterEgo = 10,
    Avenger = 11,
    MoonCancer = 23,
    Foreigner = 25
}

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
    starRate: Number
})