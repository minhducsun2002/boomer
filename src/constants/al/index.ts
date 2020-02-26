export enum Armor {
    LIGHT = 1,
    MEDIUM = 2,
    HEAVY = 3
}

/** Equipment proficiency. Should at maximum be 200%, I guess */
export type Proficiency = number;

/** Ship type ID */
export type ShipType = number;

/** Group ID (maybe representing one ship) */
export type Group = number;

/** Numeric code shown to users, I think? */
export type code = number;

/** Ship level */
export type Level = number;

/** Rarity code */
export enum Rarity {
    Gray = 2,
    Blue = 3,
    Purple = 4,
    Gold = 5,
    SSR = 6
}

/** stats */
export type HP = number; 
export type FP = number;
export type TRP = number;
export type AA = number;
export type AV = number;
export type RLD = number;
export type ACC = number;
export type EVA = number;
export type SPD = number;
export type LUK = number;
export type ASW = number;

// nations & factions
// I am hardcoding this, as the game does the same.
// model/const/nation.lua
export const NationKey = {
    [0]: 'word_shipNation_other',
    [1]: 'word_shipNation_baiYing',
    [2]: "word_shipNation_huangJia",
    [3]: "word_shipNation_chongYing",
    [4]: "word_shipNation_tieXue",
    [5]: "word_shipNation_dongHuang",
    [6]: "word_shipNation_saDing",
    [7]: "word_shipNation_beiLian",
    [8]: "word_shipNation_ziyou",
    [9]: "word_shipNation_weixi",
    [101]: "word_shipNation_np",
    [102]: "word_shipNation_bili",
    [103]: "word_shipNation_um",
    [104]: "word_shipNation_ai",
    [105]: "word_shipNation_holo"
}

export const FactionKey = {
    [0] : "guild_faction_unknown",
    [1]: "guild_faction_blhx",
    [2]: "guild_faction_blhx",
    [3]: "guild_faction_cszz",
    [4]: "guild_faction_cszz",
    [5]: "guild_faction_blhx",
    [6]: "guild_faction_cszz",
    [7]: "guild_faction_blhx",
    [8]: "guild_faction_blhx",
    [9]: "guild_faction_cszz",
    [101] : "guild_faction_unknown",
    [102] : "guild_faction_unknown",
    [103] : "guild_faction_unknown",
    [104] : "guild_faction_unknown",
    [105] : "guild_faction_unknown"

}

export const ArmorKey = {
    [Armor.HEAVY]: 'word_heavyarmor',
    [Armor.LIGHT]: 'word_lightArmor',
    [Armor.MEDIUM]: 'word_mediumArmor',
}