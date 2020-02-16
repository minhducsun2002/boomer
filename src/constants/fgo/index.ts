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

/** Servant attribute */
export enum Attribute {
    STAR = 4,
    BEAST = 5,
    HUMAN = 1,
    EARTH = 3,
    HEAVEN = 2,
}

/** Base attack multiplier for servant (class-agnostic) */
export type AttackRate = number;