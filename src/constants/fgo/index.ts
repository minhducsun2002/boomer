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
export enum CardType { ARTS = 1, BUSTER = 2, QUICK = 3, EXTRA = 4 };
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
    Foreigner = 25,
}

/** Base attack multiplier for servant (class-agnostic) */
export type AttackRate = number;
/** Action Points */
export type AP = number;
/** Servant level */
export type Level = number;
/** Chapter ID */
export type Chapter = number;
/** War ID */
export type War = number;
/** Spot ID */
export type Spot = number;
/** Damage distribution */
export type DamageDistribution = number[];
/** Item ID */
export type Item = number;

export enum ApplyTarget {
    PLAYER = 1,
    ENEMY, PLAYER_AND_ENEMY
}

export enum FuncType {
    NONE = 0,
    ADD_STATE = 1,
    SUB_STATE = 2,
    DAMAGE = 3,
    DAMAGE_NP = 4,
    GAIN_STAR = 5,
    GAIN_HP = 6,
    GAIN_NP = 7,
    LOSS_NP = 8,
    SHORTEN_SKILL = 9,
    EXTEND_SKILL = 10,
    RELEASE_STATE = 11,
    LOSS_HP = 12,
    INSTANT_DEATH = 13,
    DAMAGE_NP_PIERCE = 14,
    DAMAGE_NP_INDIVIDUAL = 15,
    ADD_STATE_SHORT = 16,
    GAIN_HP_PER = 17,
    DAMAGE_NP_STATE_INDIVIDUAL = 18,
    HASTEN_NPTURN = 19,
    DELAY_NPTURN = 20,
    DAMAGE_NP_HPRATIO_HIGH = 21,
    DAMAGE_NP_HPRATIO_LOW = 22,
    CARD_RESET = 23,
    REPLACE_MEMBER = 24,
    LOSS_HP_SAFE = 25,
    DAMAGE_NP_COUNTER = 26,
    DAMAGE_NP_STATE_INDIVIDUAL_FIX = 27,
    DAMAGE_NP_SAFE = 28,
    CALL_SERVANT = 29,
    PT_SHUFFLE = 30,
    LOSS_STAR = 31,
    CHANGE_SERVANT = 32,
    CHANGE_BG = 33,
    DAMAGE_VALUE = 34,
    WITHDRAW = 35,
    FIX_COMMANDCARD = 36,
    SHORTEN_BUFFTURN = 37,
    EXTEND_BUFFTURN = 38,
    SHORTEN_BUFFCOUNT = 39,
    EXTEND_BUFFCOUNT = 40,
    CHANGE_BGM = 41,
    DISPLAY_BUFFSTRING = 42,
    GAIN_NP_BUFF_INDIVIDUAL_SUM = 44,
    SET_SYSTEM_ALIVE_FLAG = 45,
    FORCE_INSTANT_DEATH = 46,
    DAMAGE_NP_RARE = 47,
    GAIN_NP_FROM_TARGETS = 48,
    GAIN_HP_FROM_TARGETS = 49,
    LOSS_HP_PER = 50,
    LOSS_HP_PER_SAFE = 51,
    SHORTEN_USER_EQUIP_SKILL = 52,
    QUICK_CHANGE_BG = 53,
    SHIFT_SERVANT = 54,
    DAMAGE_NP_AND_CHECK_INDIVIDUALITY = 55,
    ABSORB_NPTURN = 56,
    OVERWRITE_DEAD_TYPE = 57,
    FORCE_ALL_BUFF_NOACT = 58,
    BREAK_GAUGE_UP = 59,
    BREAK_GAUGE_DOWN = 60,
    EXP_UP = 101,
    QP_UP = 102,
    DROP_UP = 103,
    FRIEND_POINT_UP = 104,
    EVENT_DROP_UP = 105,
    EVENT_DROP_RATE_UP = 106,
    EVENT_POINT_UP = 107,
    EVENT_POINT_RATE_UP = 108,
    TRANSFORM_SERVANT = 109,
    QP_DROP_UP = 110,
    SERVANT_FRIENDSHIP_UP = 111,
    USER_EQUIP_EXP_UP = 112,
    CLASS_DROP_UP = 113,
    ENEMY_ENCOUNT_COPY_RATE_UP = 114,
    ENEMY_ENCOUNT_RATE_UP = 115,
    ENEMY_PROB_DOWN = 116,
    GET_REWARD_GIFT = 117,
    SEND_SUPPORT_FRIEND_POINT = 118,
    MOVE_POSITION = 119,
    REVIVAL = 120,
    DAMAGE_NP_INDIVIDUAL_SUM = 121,
    FRIEND_POINT_UP_DUPLICATE = 123
}

export enum TargetType {
    SELF = 0,
    PT_ONE = 1,
    PT_ANOTHER = 2,
    PT_ALL = 3,
    ENEMY = 4,
    ENEMY_ANOTHER = 5,
    ENEMY_ALL = 6,
    PT_FULL = 7,
    ENEMY_FULL = 8,
    PT_OTHER = 9,
    PT_ONE_OTHER = 10,
    PT_RANDOM = 11,
    ENEMY_OTHER = 12,
    ENEMY_RANDOM = 13,
    PT_OTHER_FULL = 14,
    ENEMY_OTHER_FULL = 15,
    PTSELECT_ONE_SUB = 16,
    PTSELECT_SUB = 17,
    PT_ONE_ANOTHER_RANDOM = 18,
}

export enum Buff {
    NONE = 0,
    UP_COMMANDATK = 1,
    UP_STARWEIGHT = 2,
    UP_CRITICALPOINT = 3,
    DOWN_CRITICALPOINT = 4,
    REGAIN_NP = 5,
    REGAIN_STAR = 6,
    REGAIN_HP = 7,
    REDUCE_HP = 8,
    UP_ATK = 9,
    DOWN_ATK = 10,
    UP_DAMAGE = 11,
    DOWN_DAMAGE = 12,
    ADD_DAMAGE = 13,
    SUB_DAMAGE = 14,
    UP_NPDAMAGE = 15,
    DOWN_NPDAMAGE = 16,
    UP_DROPNP = 17,
    UP_CRITICALDAMAGE = 18,
    DOWN_CRITICALDAMAGE = 19,
    UP_SELFDAMAGE = 20,
    DOWN_SELFDAMAGE = 21,
    ADD_SELFDAMAGE = 22,
    SUB_SELFDAMAGE = 23,
    AVOIDANCE = 24,
    BREAK_AVOIDANCE = 25,
    INVINCIBLE = 26,
    UP_GRANTSTATE = 27,
    DOWN_GRANTSTATE = 28,
    UP_TOLERANCE = 29,
    DOWN_TOLERANCE = 30,
    AVOID_STATE = 31,
    DONOT_ACT = 32,
    DONOT_SKILL = 33,
    DONOT_NOBLE = 34,
    DONOT_RECOVERY = 35,
    DISABLE_GENDER = 36,
    GUTS = 37,
    UP_HATE = 38,
    ADD_INDIVIDUALITY = 40,
    SUB_INDIVIDUALITY = 41,
    UP_DEFENCE = 42,
    DOWN_DEFENCE = 43,
    UP_COMMANDSTAR = 50,
    UP_COMMANDNP = 51,
    UP_COMMANDALL = 52,
    DOWN_COMMANDALL = 60,
    DOWN_STARWEIGHT = 61,
    REDUCE_NP = 62,
    DOWN_DROPNP = 63,
    UP_GAIN_HP = 64,
    DOWN_GAIN_HP = 65,
    DOWN_COMMANDATK = 66,
    DOWN_COMMANSTAR = 67,
    DOWN_COMMANDNP = 68,
    UP_CRITICALRATE = 70,
    DOWN_CRITICALRATE = 71,
    PIERCE_INVINCIBLE = 72,
    AVOID_INSTANTDEATH = 73,
    UP_RESIST_INSTANTDEATH = 74,
    UP_NONRESIST_INSTANTDEATH = 75,
    DELAY_FUNCTION = 76,
    REGAIN_NP_USED_NOBLE = 77,
    DEAD_FUNCTION = 78,
    UP_MAXHP = 79,
    DOWN_MAXHP = 80,
    ADD_MAXHP = 81,
    SUB_MAXHP = 82,
    BATTLESTART_FUNCTION = 83,
    WAVESTART_FUNCTION = 84,
    SELFTURNEND_FUNCTION = 85,
    UP_GIVEGAIN_HP = 87,
    DOWN_GIVEGAIN_HP = 88,
    COMMANDATTACK_FUNCTION = 89,
    DEADATTACK_FUNCTION = 90,
    UP_SPECIALDEFENCE = 91,
    DOWN_SPECIALDEFENCE = 92,
    UP_DAMAGEDROPNP = 93,
    DOWN_DAMAGEDROPNP = 94,
    ENTRY_FUNCTION = 95,
    UP_CHAGETD = 96,
    REFLECTION_FUNCTION = 97,
    UP_GRANT_SUBSTATE = 98,
    DOWN_GRANT_SUBSTATE = 99,
    UP_TOLERANCE_SUBSTATE = 100,
    DOWN_TOLERANCE_SUBSTATE = 101,
    UP_GRANT_INSTANTDEATH = 102,
    DOWN_GRANT_INSTANTDEATH = 103,
    GUTS_RATIO = 104,
    DAMAGE_FUNCTION = 86,
    UP_DEFENCECOMMANDALL = 105,
    DOWN_DEFENCECOMMANDALL = 106,
    OVERWRITE_BATTLECLASS = 107,
    OVERWRITE_CLASSRELATIO_ATK = 108,
    OVERWRITE_CLASSRELATIO_DEF = 109,
    UP_DAMAGE_INDIVIDUALITY = 110,
    DOWN_DAMAGE_INDIVIDUALITY = 111,
    UP_DAMAGE_INDIVIDUALITY_ACTIVEONLY = 112,
    DOWN_DAMAGE_INDIVIDUALITY_ACTIVEONLY = 113,
    UP_NPTURNVAL = 114,
    DOWN_NPTURNVAL = 115,
    MULTIATTACK = 116,
    UP_GIVE_NP = 117,
    DOWN_GIVE_NP = 118,
    UP_RESISTANCE_DELAY_NPTURN = 119,
    DOWN_RESISTANCE_DELAY_NPTURN = 120,
    PIERCE_DEFENCE = 121,
    UP_GUTS_HP = 122,
    DOWN_GUTS_HP = 123,
    UP_FUNCGAIN_NP = 124,
    DOWN_FUNCGAIN_NP = 125,
    UP_FUNC_HP_REDUCE = 126,
    DOWN_FUNC_HP_REDUCE = 127,
    UP_DEFENCECOMMAN_DAMAGE = 128,
    DOWN_DEFENCECOMMAN_DAMAGE = 129,
    NPATTACK_PREV_BUFF = 130,
    FIX_COMMANDCARD = 131,
    DONOT_GAINNP = 132,
    FIELD_INDIVIDUALITY = 133,
    DONOT_ACT_COMMANDTYPE = 134,
    UP_DAMAGE_EVENT_POINT = 135,
    UP_DAMAGE_SPECIAL = 136,
    ATTACK_FUNCTION = 137,
    COMMANDCODEATTACK_FUNCTION = 138,
    DONOT_NOBLE_COND_MISMATCH = 139,
    DONOT_SELECT_COMMANDCARD = 140,
    DONOT_REPLACE = 141,
    SHORTEN_USER_EQUIP_SKILL = 142,
    TD_TYPE_CHANGE = 143,
    OVERWRITE_CLASS_RELATION = 144,
    TD_TYPE_CHANGE_ARTS = 145,
    TD_TYPE_CHANGE_BUSTER = 146,
    TD_TYPE_CHANGE_QUICK = 147,
    COMMANDATTACK_BEFORE_FUNCTION = 148,
    GUTS_FUNCTION = 149,
    UP_CRITICAL_RATE_DAMAGE_TAKEN = 150,
    DOWN_CRITICAL_RATE_DAMAGE_TAKEN = 151,
    UP_CRITICAL_STAR_DAMAGE_TAKEN = 152,
    DOWN_CRITICAL_STAR_DAMAGE_TAKEN = 153,
    SKILL_RANK_UP = 154,
    AVOIDANCE_INDIVIDUALITY = 155,
    CHANGE_COMMAND_CARD_TYPE = 156,
    SPECIAL_INVINCIBLE = 157
}

export enum BuffAction {
    NONE = 0,
    COMMAND_ATK = 1,
    COMMAND_DEF = 2,
    ATK = 3,
    DEFENCE = 4,
    DEFENCE_PIERCE = 5,
    SPECIALDEFENCE = 6,
    DAMAGE = 7,
    DAMAGE_INDIVIDUALITY = 8,
    DAMAGE_INDIVIDUALITY_ACTIVEONLY = 9,
    SELFDAMAGE = 10,
    CRITICAL_DAMAGE = 11,
    NPDAMAGE = 12,
    GIVEN_DAMAGE = 13,
    RECEIVE_DAMAGE = 14,
    PIERCE_INVINCIBLE = 15,
    INVINCIBLE = 16,
    BREAK_AVOIDANCE = 17,
    AVOIDANCE = 18,
    OVERWRITE_BATTLECLASS = 19,
    OVERWRITE_CLASSRELATIO_ATK = 20,
    OVERWRITE_CLASSRELATIO_DEF = 21,
    COMMAND_NP_ATK = 22,
    COMMAND_NP_DEF = 23,
    DROP_NP = 24,
    DROP_NP_DAMAGE = 25,
    COMMAND_STAR_ATK = 26,
    COMMAND_STAR_DEF = 27,
    CRITICAL_POINT = 28,
    STARWEIGHT = 29,
    TURNEND_NP = 30,
    TURNEND_STAR = 31,
    TURNEND_HP_REGAIN = 32,
    TURNEND_HP_REDUCE = 33,
    GAIN_HP = 34,
    TURNVAL_NP = 35,
    GRANT_STATE = 36,
    RESISTANCE_STATE = 37,
    AVOID_STATE = 38,
    DONOT_ACT = 39,
    DONOT_SKILL = 40,
    DONOT_NOBLE = 41,
    DONOT_RECOVERY = 42,
    INDIVIDUALITY_ADD = 43,
    INDIVIDUALITY_SUB = 44,
    HATE = 45,
    CRITICAL_RATE = 46,
    AVOID_INSTANTDEATH = 47,
    RESIST_INSTANTDEATH = 48,
    NONRESIST_INSTANTDEATH = 49,
    REGAIN_NP_USED_NOBLE = 50,
    FUNCTION_DEAD = 51,
    MAXHP_RATE = 52,
    MAXHP_VALUE = 53,
    FUNCTION_WAVESTART = 54,
    FUNCTION_SELFTURNEND = 55,
    GIVE_GAIN_HP = 56,
    FUNCTION_COMMANDATTACK = 57,
    FUNCTION_DEADATTACK = 58,
    FUNCTION_ENTRY = 59,
    CHAGETD = 60,
    GRANT_SUBSTATE = 61,
    TOLERANCE_SUBSTATE = 62,
    GRANT_INSTANTDEATH = 63,
    FUNCTION_DAMAGE = 64,
    FUNCTION_REFLECTION = 65,
    MULTIATTACK = 66,
    GIVE_NP = 67,
    RESISTANCE_DELAY_NPTURN = 68,
    PIERCE_DEFENCE = 69,
    GUTS_HP = 70,
    FUNCGAIN_NP = 71,
    FUNC_HP_REDUCE = 72,
    FUNCTION_NPATTACK = 73,
    FIX_COMMANDCARD = 74,
    DONOT_GAINNP = 75,
    FIELD_INDIVIDUALITY = 76,
    DONOT_ACT_COMMANDTYPE = 77,
    DAMAGE_EVENT_POINT = 78,
}

export enum ValsType {
    Rate = 0,
    Turn = 1,
    Count = 2,
    Value = 3,
    Value2 = 4,
    UseRate = 5,
    Target = 6,
    Correction = 7,
    ParamAdd = 8,
    ParamMax = 9,
    HideMiss = 10,
    OnField = 11,
    HideNoEffect = 12,
    Unaffected = 13,
    ShowState = 14,
    AuraEffectId = 15,
    ActSet = 16,
    ActSetWeight = 17,
    ShowQuestNoEffect = 18,
    CheckDead = 19,
    RatioHPHigh = 20,
    RatioHPLow = 21,
    SetPassiveFrame = 22,
    ProcPassive = 23,
    ProcActive = 24,
    HideParam = 25,
    SkillID = 26,
    SkillLV = 27,
    ShowCardOnly = 28,
    EffectSummon = 29,
    RatioHPRangeHigh = 30,
    RatioHPRangeLow = 31,
    TargetList = 32,
    OpponentOnly = 33,
}

export enum ItemType {
    QP = 1,
    STONE = 2,
    AP_RECOVER = 3,
    AP_ADD = 4,
    MANA = 5,
    KEY = 6,
    GACHA_CLASS = 7,
    GACHA_RELIC = 8,
    GACHA_TICKET = 9,
    LIMIT = 10,
    SKILL_LV_UP = 11,
    TD_LV_UP = 12,
    FRIEND_POINT = 13,
    EVENT_POINT = 14,
    EVENT_ITEM = 15,
    QUEST_REWARD_QP = 16,
    CHARGE_STONE = 17,
    RP_ADD = 18,
    BOOST_ITEM = 19,
    STONE_FRAGMENTS = 20,
    ANONYMOUS = 21,
    RARE_PRI = 22,
    COSTUME_RELEASE = 23,
    ITEM_SELECT = 24,
}

export enum QuestType {
    MAIN = 1,
    FREE = 2,
    FRIENDSHIP = 3,
    EVENT = 5,
    HEROBALLAD = 6,
}

export enum QuestConsumeType {
    NONE = 0,
    AP = 1,
    RP = 2,
    ITEM = 3,
}

export enum ConditionType {
    NONE = 0,
    QUEST_CLEAR = 1,
    ITEM_GET = 2,
    USE_ITEM_ETERNITY = 3,
    USE_ITEM_TIME = 4,
    USE_ITEM_COUNT = 5,
    SVT_LEVEL = 6,
    SVT_LIMIT = 7,
    SVT_GET = 8,
    SVT_FRIENDSHIP = 9,
    SVT_GROUP = 10,
    EVENT = 11,
    DATE = 12,
    WEEKDAY = 13,
    PURCHASE_QP_SHOP = 14,
    PURCHASE_STONE_SHOP = 15,
    WAR_CLEAR = 16,
    FLAG = 17,
    SVT_COUNT_STOP = 18,
    BIRTH_DAY = 19,
    EVENT_END = 20,
    SVT_EVENT_JOIN = 21,
    MISSION_CONDITION_DETAIL = 22,
    EVENT_MISSION_CLEAR = 23,
    EVENT_MISSION_ACHIEVE = 24,
    QUEST_CLEAR_NUM = 25,
    NOT_QUEST_GROUP_CLEAR = 26,
    RAID_ALIVE = 27,
    RAID_DEAD = 28,
    RAID_DAMAGE = 29,
    QUEST_CHALLENGE_NUM = 30,
    MASTER_MISSION = 31,
    QUEST_GROUP_CLEAR = 32,
    SUPER_BOSS_DAMAGE = 33,
    SUPER_BOSS_DAMAGE_ALL = 34,
    PURCHASE_SHOP = 35,
    QUEST_NOT_CLEAR = 36,
    NOT_SHOP_PURCHASE = 37,
    NOT_SVT_GET = 38,
    NOT_EVENT_SHOP_PURCHASE = 39,
    SVT_HAVING = 40,
    NOT_SVT_HAVING = 41,
    QUEST_CHALLENGE_NUM_EQUAL = 42,
    QUEST_CHALLENGE_NUM_BELOW = 43,
    QUEST_CLEAR_NUM_EQUAL = 44,
    QUEST_CLEAR_NUM_BELOW = 45,
    QUEST_CLEAR_PHASE = 46,
    NOT_QUEST_CLEAR_PHASE = 47,
    EVENT_POINT_GROUP_WIN = 48,
    EVENT_NORMA_POINT_CLEAR = 49,
    QUEST_AVAILABLE = 50,
    QUEST_GROUP_AVAILABLE_NUM = 51,
    EVENT_NORMA_POINT_NOT_CLEAR = 52,
    NOT_ITEM_GET = 53,
    COSTUME_GET = 54,
    QUEST_RESET_AVAILABLE = 55,
    SVT_GET_BEFORE_EVENT_END = 56,
    QUEST_CLEAR_RAW = 57,
    QUEST_GROUP_CLEAR_RAW = 58,
    EVENT_GROUP_POINT_RATIO_IN_TERM = 59,
    EVENT_GROUP_RANK_IN_TERM = 60,
    NOT_EVENT_RACE_QUEST_OR_NOT_ALL_GROUP_GOAL = 61,
    EVENT_GROUP_TOTAL_WIN_EACH_PLAYER = 62,
    EVENT_SCRIPT_PLAY = 63,
    SVT_COSTUME_RELEASED = 64,
    QUEST_NOT_CLEAR_AND = 65,
    SVT_RECOVERD = 66,
    SHOP_RELEASED = 67,
    EVENT_POINT = 68,
    EVENT_REWARD_DISP_COUNT = 69,
    EQUIP_WITH_TARGET_COSTUME = 70,
    RAID_GROUP_DEAD = 71,
    NOT_SVT_GROUP = 72,
    NOT_QUEST_RESET_AVAILABLE = 73,
    NOT_QUEST_CLEAR_RAW = 74,
    NOT_QUEST_GROUP_CLEAR_RAW = 75,
    NOT_EVENT_MISSION_CLEAR = 76,
    NOT_EVENT_MISSION_ACHIEVE = 77,
    NOT_COSTUME_GET = 78,
    NOT_SVT_COSTUME_RELEASED = 79,
    NOT_EVENT_RACE_QUEST_OR_NOT_TARGET_RANK_GOAL = 80,
    PLAYER_GENDER_TYPE = 81,
    SHOP_GROUP_LIMIT_NUM = 82,
    EVENT_GROUP_POINT = 83,
    EVENT_GROUP_POINT_BELOW = 84,
    EVENT_TOTAL_POINT = 85,
    EVENT_TOTAL_POINT_BELOW = 86,
    EVENT_VALUE = 87,
    EVENT_VALUE_BELOW = 88,
    EVENT_FLAG = 89,
    EVENT_STATUS = 90,
    NOT_EVENT_STATUS = 91,
    FORCE_FALSE = 92,
    SVT_HAVING_LIMIT_MAX = 93,
    EVENT_POINT_BELOW = 94,
    SVT_EQUIP_FRIENDSHIP_HAVING = 95,
    MOVIE_NOT_DOWNLOAD = 96,
    MULTIPLE_DATE = 97,
    SVT_FRIENDSHIP_ABOVE = 98,
    SVT_FRIENDSHIP_BELOW = 99,
    MOVIE_DOWNLOADED = 100,
    ROUTE_SELECT = 101,
    NOT_ROUTE_SELECT = 102,
    LIMIT_COUNT = 103,
    LIMIT_COUNT_ABOVE = 104,
    LIMIT_COUNT_BELOW = 105,
    BAD_END_PLAY = 106,
    COMMAND_CODE_GET = 107,
    NOT_COMMAND_CODE_GET = 108,
    ALL_USERS_BOX_GACHA_COUNT = 109,
    TOTAL_TD_LEVEL = 110,
    TOTAL_TD_LEVEL_ABOVE = 111,
    TOTAL_TD_LEVEL_BELOW = 112,
    COMMON_RELEASE = 113,
    BATTLE_RESULT_WIN = 114,
    BATTLE_RESULT_LOSE = 115,
    EVENT_VALUE_EQUAL = 116,
    BOARD_GAME_TOKEN_HAVING = 117,
    BOARD_GAME_TOKEN_GROUP_HAVING = 118,
    EVENT_FLAG_ON = 119,
    EVENT_FLAG_OFF = 120,
    QUEST_STATUS_FLAG_ON = 121,
    QUEST_STATUS_FLAG_OFF = 122,
    EVENT_VALUE_NOT_EQUAL = 123,
    LIMIT_COUNT_MAX_EQUAL = 124,
    LIMIT_COUNT_MAX_ABOVE = 125,
    LIMIT_COUNT_MAX_BELOW = 126,
    BOARD_GAME_TOKEN_GET_NUM = 127,
    BATTLE_LINE_WIN_ABOVE = 128,
    BATTLE_LINE_LOSE_ABOVE = 129,
    BATTLE_LINE_CONTINUE_WIN = 130,
    BATTLE_LINE_CONTINUE_LOSE = 131,
    BATTLE_LINE_CONTINUE_WIN_BELOW = 132,
    BATTLE_LINE_CONTINUE_LOSE_BELOW = 133,
    BATTLE_GROUP_WIN_AVOVE = 134,
    BATTLE_GROUP_LOSE_AVOVE = 135,
}

// https://github.com/atlasacademy/fgo-game-data-api/blob/cfc2632b4285508dbf5b4d6c6a2e39f6ecd47e2e/app/data/enums.py
export enum Trait {
    genderMale = 1,
    genderFemale = 2,
    genderUnknown = 3,
    classSaber = 100,
    classLancer = 101,
    classArcher = 102,
    classrider = 103,
    classCaster = 104,
    classAssassin = 105,
    classBerserker = 106,
    classShielder = 107,
    classRuler = 108,
    classAlterEgo = 109,
    classAvenger = 110,
    classDemonGodPillar = 111,
    classGrandCaster = 112,
    classBeastI = 113,
    classBeastII = 114,
    classMoonCancer = 115,
    classBeastIIIR = 116,
    classForeigner = 117,
    classBeastIIIL = 118,
    classBeastUnknown = 119,
    attributeSky = 200,
    attributeEarth = 201,
    attributeHuman = 202,
    attributeStar = 203,
    attributeBeast = 204,
    alignmentLawful = 300,
    alignmentChaotic = 301,
    alignmentNeutral = 302,
    alignmentGood = 303,
    alignmentEvil = 304,
    alignmentBalanced = 305,
    alignmentMadness = 306,
    alignmentSummer = 308,
    basedOnServant = 1000,
    human = 1001,
    undead = 1002,
    artificialDemon = 1003,
    demonBeast = 1004,
    daemon = 1005,
    soldier = 1100,
    amazoness = 1101,
    skeleton = 1102,
    zombie = 1103,
    ghost = 1104,
    automata = 1105,
    golem = 1106,
    spellBook = 1107,
    homunculus = 1108,
    lamia = 1110,
    centaur = 1111,
    werebeast = 1112,
    chimera = 1113,
    wyvern = 1117,
    dragonType = 1118,
    gazer = 1119,
    handOrDoor = 1120,
    demonGodPillar = 1121,
    shadowServant = 1122,
    oni = 1132,
    hand = 1133,
    door = 1134,
    threatToHumanity = 1172,
    divine = 2000,
    humanoid = 2001,
    dragon = 2002,
    dragonSlayer = 2003,
    roman = 2004,
    wildbeast = 2005,
    atalante = 2006,
    saberface = 2007,
    weakToEnumaElish = 2008,
    riding = 2009,
    arthur = 2010,
    skyOrEarth = 2011,
    brynhildsBeloved = 2012,
    undeadOrDaemon = 2018,
    demonic = 2019,
    skyOrEarthExceptPseudoAndDemi = 2037,
    fieldSunlight = 2038,
    fieldShore = 2039,
    divineOrDaemonOrUndead = 2040,
    fieldForest = 2073,
    blessedByKur = 2074,
    saberClassServant = 2075,
    superGiant = 2076,
    king = 2113,
    greekMythologyMales = 2114,
    fieldBurning = 2121,
    illya = 2355,
    genderUnknownServant = 2356,
    kingProteaGrowth = 2387,
    fieldCity = 2392,
    argonaut = 2466,
    genderCaenisServant = 2615,
    humanoidServant = 2631,
    beastServant = 2632,
    livingHuman = 2654,
    giant = 2666,
    childServant = 2667,
    normalAttack0 = 3000,
    normalAttack1 = 3001,
    normalAttack2 = 3002,
    buffPositiveEffect = 3004,
    buffNegativeEffect = 3005,
    buffIncreaseDamage = 3006,
    buffIncreaseDefence = 3007,
    buffDecreaseDamage = 3008,
    buffDecreaseDefence = 3009,
    buffMentalEffect = 3010,
    buffPoison = 3011,
    buffCharm = 3012,
    buffPetrify = 3013,
    buffStun = 3014,
    buffBurn = 3015,
    buffSpecialResistUp = 3016,
    buffSpecialResistDown = 3017,
    buffEvadeAndInvincible = 3018,
    buffSureHit = 3019,
    buffNpSeal = 3020,
    buffEvade = 3021,
    buffInvincible = 3022,
    buffTargetFocus = 3023,
    buffGuts = 3024,
    skillSeal = 3025,
    buffCurse = 3026,
    buffAtkUp = 3027,
    buffPowerModStrUp = 3028,
    buffDamagePlus = 3029,
    buffNpDamageUp = 3030,
    buffCritDamageUp = 3031,
    buffCritRateUp = 3032,
    buffAtkDown = 3033,
    buffPowerModStrDown = 3034,
    buffDamageMinus = 3035,
    buffNpDamageDown = 3036,
    buffCritDamageDown = 3037,
    buffCritRateDown = 3038,
    buffDeathResistDown = 3039,
    buffDefenceUp = 3040,
    buffMaxHpUpPercent = 3041,
    buffMaxHpDownPercent = 3042,
    buffMaxHpUp = 3043,
    buffMaxHpDown = 3044,
    buffStunLike = 3045,
    buffIncreasePoisonEffectiveness = 3046,
    buffPigify = 3047,
    buffCurseEffectUp = 3048,
    buffTerrorStunChanceAfterTurn = 3049,
    buffConfusion = 3052,
    buffOffensiveMode = 3053,
    buffDefensiveMode = 3054,
    buffLockCardsDeck = 3055,
    buffDisableColorCard = 3056,
    buffChangeField = 3057,
    buffIncreaseDefenceAgainstIndividuality = 3058,
    buffInvinciblePierce = 3059,
    buffHpRecoveryPerTurn = 3060,
    buffNegativeEffectImmunity = 3061,
    buffNegativeEffectAtTurnEnd = 3063,
    buffSpecialInvincible = 3064,
    buffSkillRankUp = 3065,
    cardArts = 4001,
    cardBuster = 4002,
    cardQuick = 4003,
    cardExtra = 4004,
    cardNP = 4007,
    playerCards = 4008,
    criticalHit = 4100,
    aoeNP = 4101,
    canBeInBattle = 5000,
    notBasedOnServant = 5010,
}

/** Servant attribute */
export const Attribute = {
    STAR: Trait.attributeStar,
    BEAST: Trait.attributeBeast,
    HUMAN: Trait.attributeHuman,
    EARTH: Trait.attributeEarth,
    HEAVEN: Trait.attributeSky,
}

/** Plus mstSvt.gender to get trait */
export const GenderModifier = 0;
/** Plus mstSvt.classId to get trait */
export const ClassModifier = 99;

export enum SkillType {
    ACTIVE = 1,
    PASSIVE = 2
}