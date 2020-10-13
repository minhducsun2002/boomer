import {
    GenderType,
    Trait as t,
    FuncType as fType,
    TargetType as tType,
    ApplyTarget as aType,
    Buff as bType,
    ValsType as vType
} from './';

export const Gender = {
    [GenderType.Male]: ['Male'],
    [GenderType.Female]: ['Female'],
    [GenderType.Male | GenderType.Female]: ['Male', 'Female']
}

export const Trait = {
    [t.alignmentBalanced]: 'Balanced',
    [t.alignmentChaotic]: 'Chaotic',
    [t.alignmentEvil]: 'Evil',
    [t.alignmentGood]: 'Good',
    [t.alignmentLawful]: 'Lawful',
    [t.alignmentMadness]: 'Madness',
    [t.alignmentNeutral]: 'Neutral',
    [t.alignmentSummer]: 'Summer',
    [t.amazoness]: 'Amazoness',
    [t.arthur]: 'Arthur',
    [t.artificialDemon]: 'Artificial Demon',
    [t.atalante]: 'Atalante',
    [t.attributeStar]: 'Star',
    [t.attributeBeast]: 'Beast',
    [t.attributeEarth]: 'Earth',
    [t.attributeHuman]: 'Human',
    [t.attributeSky]: 'Heaven',
    [t.automata]: 'Automata',
    [t.basedOnServant]: 'Servant',
    [t.beastServant]: 'Beast',
    [t.blessedByKur]: 'Blessed by Kur',
    [t.brynhildsBeloved]: `Brynhildr's Beloved`,
    [t.buffAtkDown]: 'ATK Down',
    [t.buffAtkUp]: 'ATK Up',
    [t.buffBurn]: 'Burn',
    [t.buffChangeField]: 'Change Field',
    [t.buffCharm]: 'Charm',
    [t.buffConfusion]: 'Confusion',
    [t.buffCritDamageDown]: 'Critical Damage Down',
    [t.buffCritDamageUp]: 'Critical Damage Up',
    [t.buffCritRateDown]: 'Critical Rate Down',
    [t.buffCritRateUp]: 'Critical Rate Up',
    [t.buffCurse]: 'Curse',
    [t.buffCurseEffectUp]: 'Curse Effectiveness Up',
    [t.buffDamageMinus]: 'ATK Minus',
    [t.buffDamagePlus]: 'ATK Plus',
    [t.buffDeathResistDown]: 'Death Resist Down',
    [t.buffDecreaseDamage]: 'Damage Down',
    [t.buffDecreaseDefence]: 'DEF Down',
    [t.buffDefenceUp]: 'DEF Up',
    [t.buffDefensiveMode]: '',
    // certain card type(s) are disabled
    [t.buffDisableColorCard]: 'Disabled Cards',
    [t.buffEvade]: 'Evade',
    [t.buffEvadeAndInvincible]: 'Evade or Invincible',
    [t.buffGuts]: 'Guts',
    [t.buffHpRecoveryPerTurn]: 'HP Recovery per Turn',
    [t.buffIncreaseDamage]: 'Damage Up',
    [t.buffIncreaseDefence]: 'DEF Up',
    [t.buffIncreaseDefenceAgainstIndividuality]: 'DEF Up against',
    [t.buffIncreasePoisonEffectiveness]: 'Poison Effectiveness Up',
    [t.buffInvincible]: 'Invincible',
    [t.buffInvinciblePierce]: 'Ignore Invincible',
    [t.buffLockCardsDeck]: 'Locked Card Set',
    [t.buffMaxHpDown]: 'Max HP Down',
    [t.buffMaxHpDownPercent]: 'Max HP Down by percentage',
    [t.buffMaxHpUp]: 'Max HP Up',
    [t.buffMaxHpUpPercent]: 'Max HP Up by percentage',
    [t.buffMentalEffect]: 'Mental Effect',
    [t.buffNegativeEffect]: 'Debuff',
    [t.buffNegativeEffectAtTurnEnd]: 'Debuff at end of turn',
    [t.buffNegativeEffectImmunity]: 'Debuff Immunity',
    [t.buffNpDamageDown]: 'NP Damage Down',
    [t.buffNpDamageUp]: 'NP Damage Up',
    [t.buffNpSeal]: 'NP Seal',
    [t.buffOffensiveMode]: '',
    [t.buffPetrify]: 'Petrify',
    [t.buffPigify]: 'Pigify',
    [t.buffPoison]: 'Poison',
    [t.buffPositiveEffect]: 'Buff',
    [t.buffPowerModStrDown]: '',
    [t.buffPowerModStrUp]: '',
    [t.buffSpecialResistDown]: '',
    [t.buffSpecialResistUp]: '',
    [t.buffStun]: 'Stun',
    [t.buffStunLike]: 'Immobilized',
    [t.buffSureHit]: 'Sure Hit',
    [t.buffTargetFocus]: 'Target Focus',
    // Abigail Williams?
    [t.buffTerrorStunChanceAfterTurn]: 'Terror',
    [t.canBeInBattle]: 'Can be in battle',
    [t.cardArts]: 'Arts Cards',
    [t.cardBuster]: 'Buster Cards',
    [t.cardExtra]: 'Extra Cards',
    [t.cardNP]: 'NP Cards',
    [t.cardQuick]: 'Quick Cards',
    [t.centaur]: 'Centaur',
    [t.chimera]: 'Chimera',
    [t.childServant]: 'Child',
    [t.classAlterEgo]: 'Alter Ego',
    [t.classArcher]: 'Archer',
    [t.classAssassin]: 'Assassin',
    [t.classAvenger]: 'Avenger',
    [t.classBeastI]: 'Beast I',
    [t.classBeastII]: 'Beast II',
    [t.classBeastIIIL]: 'Beast III/L',
    [t.classBeastIIIR]: 'Beast III/R',
    [t.classBeastUnknown]: 'Beast Unknown',
    [t.classBerserker]: 'Berserker',
    [t.classCaster]: 'Caster',
    [t.classDemonGodPillar]: 'Demon God Pillar',
    [t.classForeigner]: 'Foreigner',
    [t.classGrandCaster]: 'Grand Caster',
    [t.classLancer]: 'Lancer',
    [t.classMoonCancer]: 'Moon Cancer',
    [t.classRuler]: 'Ruler',
    [t.classSaber]: 'Saber',
    [t.classShielder]: 'Shielder',
    [t.classrider]: 'Rider',
    [t.criticalHit]: '',
    [t.daemon]: 'Daemon',
    [t.demonBeast]: 'Demon Beast',
    [t.demonGodPillar]: 'Demon God Pillar',
    [t.demonic]: 'Demonic',
    [t.divine]: 'Divine',
    // one of the above traits should cover this
    [t.divineOrDaemonOrUndead]: 'Daemon/Demonic/Divine',
    // [t.divineOrDaemonOrUndead]: '',
    [t.door]: 'Door',
    [t.dragon]: 'Dragon',
    [t.dragonSlayer]: 'Dragon Slayer',
    [t.dragonType]: 'Dragon',
    [t.fieldBurning]: 'Burning Field',
    [t.fieldCity]: 'City Field',
    [t.fieldForest]: 'Forest Field',
    [t.fieldShore]: 'Shore Field',
    [t.fieldSunlight]: 'Field with Sunlight',
    [t.gazer]: 'Gazer',
    [t.genderCaenisServant]: 'Caenis',
    [t.genderFemale]: 'Female',
    [t.genderMale]: 'Male',
    [t.genderUnknown]: 'Unknown',
    [t.genderUnknownServant]: 'Unknown Servant',
    [t.ghost]: 'Ghost',
    [t.golem]: 'Golem',
    [t.hand]: 'Hand',
    [t.handOrDoor]: 'Hand/Door',
    [t.homunculus]: 'Homunculus',
    [t.human]: 'Human',
    [t.humanoid]: 'Humanoid',
    [t.humanoidServant]: 'Hominidae Servant',
    [t.illya]: 'Illya',
    [t.king]: 'King',
    [t.lamia]: 'Lamia',
    [t.nobu]: 'Nobu',
    [t.oni]: 'Oni',
    [t.roman]: 'Roman',
    [t.riding]: 'Riding',
    [t.saberface]: 'Saberface',
    [t.saberClassServant]: 'Saber-class Servant',
    [t.shadowServant]: 'Shadow Servant',
    [t.soldier]: 'Soldier',
    [t.spellBook]: 'Spellbook',
    [t.skeleton]: 'Skeleton',
    [t.skyOrEarth]: 'Heaven or Earth',
    [t.skyOrEarthExceptPseudoAndDemi]: 'Heaven or Earth (except Pseudo-Servants & Demi-Servants)',
    [t.threatToHumanity]: 'Threat to Humanity',
    [t.undead]: 'Undead',
    [t.undeadOrDaemon]: 'Undead/Daemon',
    [t.weakToEnumaElish]: 'Weak to Enuma Elish',
    [t.werebeast]: 'Werebeast',
    [t.wildbeast]: 'Wildbeast',
    [t.wyvern]: 'Wyvern',
    [t.zombie]: 'Zombie',
}

export const FuncTypes = {
    [fType.ABSORB_NPTURN]: '',
    [fType.ADD_STATE]: 'Apply',
    [fType.ADD_STATE_SHORT]: 'Apply (short)',
    [fType.BREAK_GAUGE_DOWN]: '',
    [fType.BREAK_GAUGE_UP]: '',
    [fType.CALL_SERVANT]: 'Summon another servant',
    [fType.CARD_RESET]: 'Shuffle all cards',
    [fType.CHANGE_BG]: '',
    [fType.CHANGE_BGM]: '',
    [fType.CHANGE_SERVANT]: '',
    [fType.CLASS_DROP_UP]: 'Increase drop up for class weak against this servant',
    [fType.DAMAGE]: 'Deal damage',
    [fType.DAMAGE_NP]: 'Deal NP damage',
    [fType.DAMAGE_NP_AND_CHECK_INDIVIDUALITY]: '',
    [fType.DAMAGE_NP_COUNTER]: '',
    [fType.DAMAGE_NP_HPRATIO_HIGH]: '',
    [fType.DAMAGE_NP_HPRATIO_LOW]: 'Deal NP damage based on HP level',
    [fType.DAMAGE_NP_INDIVIDUAL]: 'Deal Special Attack NP damage',
    [fType.DAMAGE_NP_INDIVIDUAL_SUM]: '',
    [fType.DAMAGE_NP_PIERCE]: 'Deal DEF-ignoring NP damage',
    [fType.DAMAGE_NP_RARE]: '',
    [fType.DAMAGE_NP_SAFE]: '',
    [fType.DAMAGE_NP_STATE_INDIVIDUAL]: '',
    // deal Special Attack for those with a certain state
    [fType.DAMAGE_NP_STATE_INDIVIDUAL_FIX]: 'Deal NP damage & Special Attack NP damage to enemies with certain state',
    // deal a static value of damage?
    [fType.DAMAGE_VALUE]: 'Deal damage',
    [fType.DELAY_NPTURN]: 'Drain enemy charge',
    [fType.DISPLAY_BUFFSTRING]: '',
    [fType.DROP_UP]: '',
    // https://apps.atlasacademy.io/db/#/NA/skill/990264
    [fType.ENEMY_ENCOUNT_COPY_RATE_UP]: `Increase rate of enemy copies' appearance`,
    // https://apps.atlasacademy.io/db/#/NA/skill/990317
    [fType.ENEMY_ENCOUNT_RATE_UP]: `Increase rate of enemies' appearance`,
    [fType.ENEMY_PROB_DOWN]: '',
    [fType.EVENT_DROP_RATE_UP]: 'Increase event drop rate',
    [fType.EVENT_DROP_UP]: 'Increase event drop',
    [fType.EVENT_POINT_RATE_UP]: '',
    [fType.EVENT_POINT_UP]: 'Increase event point gained',
    [fType.EXP_UP]: 'Increase EXP gained',
    [fType.EXTEND_BUFFCOUNT]: '',
    [fType.EXTEND_BUFFTURN]: '',
    [fType.EXTEND_SKILL]: 'Increase skill cooldown',
    [fType.FIX_COMMANDCARD]: 'Lock card deck',
    [fType.FORCE_ALL_BUFF_NOACT]: '',
    [fType.FORCE_INSTANT_DEATH]: 'Apply Instant Death',
    [fType.FRIEND_POINT_UP]: 'Friend point gain up',
    [fType.GAIN_HP]: 'Gain HP',
    [fType.GAIN_HP_FROM_TARGETS]: 'Drain HP from target',
    [fType.GAIN_HP_PER]: 'Gain HP based on percentage',
    [fType.GAIN_NP]: 'Gain NP',
    [fType.GAIN_NP_BUFF_INDIVIDUAL_SUM]: 'Gain NP based on certain state count',
    [fType.GAIN_NP_FROM_TARGETS]: 'Gain NP from from target',
    [fType.GAIN_STAR]: 'Gain Critical Stars',
    // https://apps.atlasacademy.io/db/#/JP/skill/964246
    [fType.GET_REWARD_GIFT]: '',
    [fType.HASTEN_NPTURN]: 'Gain charge',
    [fType.INSTANT_DEATH]: 'Inflict Death',
    [fType.LOSS_HP]: 'Reduce HP',
    [fType.LOSS_HP_PER]: '',
    [fType.LOSS_HP_PER_SAFE]: '',
    [fType.LOSS_HP_SAFE]: 'Reduce HP to 1',
    [fType.LOSS_NP]: 'Decrease NP',
    [fType.LOSS_STAR]: 'Decrease Critical Stars',
    // https://youtu.be/lrHzvSckdSY?t=87
    [fType.MOVE_POSITION]: 'Move position of Zeus',
    [fType.NONE]: 'No effect',
    [fType.OVERWRITE_DEAD_TYPE]: '',
    [fType.PT_SHUFFLE]: 'Shuffle party',
    [fType.QP_DROP_UP]: 'Increase QP drop rate',
    [fType.QP_UP]: 'Increase QP gained',
    [fType.QUICK_CHANGE_BG]: 'Change field',
    [fType.RELEASE_STATE]: '',
    [fType.REPLACE_MEMBER]: 'Replace active party member',
    [fType.REVIVAL]: 'Revive',
    [fType.SEND_SUPPORT_FRIEND_POINT]: '',
    [fType.SERVANT_FRIENDSHIP_UP]: 'Increase Bond points gained',
    [fType.SUB_STATE]: 'Remove effects',
    [fType.TRANSFORM_SERVANT]: 'Swap servant',
    // https://apps.atlasacademy.io/db/#/JP/skill/962854
    [fType.USER_EQUIP_EXP_UP]: 'Increase Mystic Code EXP Gain'
}

export const TargetType = {
    [tType.ENEMY]: 'a single enemy on field',
    [tType.ENEMY_ALL]: 'all enemies on field',
    [tType.ENEMY_ANOTHER]: '',
    [tType.ENEMY_FULL]: 'all enemies',
    [tType.ENEMY_OTHER]: '',
    [tType.ENEMY_OTHER_FULL]: '',
    [tType.ENEMY_RANDOM]: 'a random single enemy on field',
    [tType.PTSELECT_ONE_SUB]: 'a (chosen) backrow ally',
    [tType.PTSELECT_SUB]: '',
    [tType.PT_ALL]: 'all allies on field',
    [tType.PT_ANOTHER]: '',
    [tType.PT_FULL]: 'all allies',
    [tType.PT_ONE]: 'a (chosen) ally',
    [tType.PT_ONE_ANOTHER_RANDOM]: '',
    [tType.PT_ONE_OTHER]: 'allies on field except the chosen one',
    [tType.PT_OTHER]: 'other allies on field',
    [tType.PT_OTHER_FULL]: 'other allies',
    [tType.PT_RANDOM]: 'a random ally on field',
    [tType.SELF]: 'self',
}

export const ApplyTarget = {
    [aType.ENEMY]: 'enemy',
    [aType.PLAYER]: 'player',
    [aType.PLAYER_AND_ENEMY]: ''
}

export const BuffTypes = {
    [bType.ADD_DAMAGE]: 'Add damage',
    [bType.ADD_INDIVIDUALITY]: 'Add trait',
    [bType.ADD_MAXHP]: 'Increase max HP',
    [bType.ADD_SELFDAMAGE]: '',
    [bType.ATTACK_FUNCTION]: '',
    [bType.AVOID_INSTANTDEATH]: 'Death Immunity',
    [bType.AVOID_STATE]: 'Immunity',
    [bType.AVOIDANCE]: 'Evade',
    [bType.BATTLESTART_FUNCTION]: '',
    [bType.BREAK_AVOIDANCE]: 'Sure Hit',
    [bType.CHANGE_COMMAND_CARD_TYPE]: 'Change card type',
    [bType.COMMANDATTACK_FUNCTION]: `Bonus effect on attacks`,
    [bType.DEAD_FUNCTION]: 'Trigger skill upon death',
    [bType.DELAY_FUNCTION]: 'Trigger skill after duration',
    [bType.DONOT_ACT]: 'Stun',
    [bType.DONOT_NOBLE]: 'NP Seal',
    [bType.DONOT_NOBLE_COND_MISMATCH]: 'NP block if condition fails',
    [bType.DONOT_RECOVERY]: 'Recovery Disabled',
    [bType.DONOT_SELECT_COMMANDCARD]: 'Do not shuffle in cards',
    [bType.DONOT_SKILL]: 'Skill Seal',
    [bType.DOWN_ATK]: 'ATK Down',
    [bType.DOWN_COMMANDALL]: 'Effectiveness Down',
    [bType.DOWN_CRITICAL_RATE_DAMAGE_TAKEN]: 'Critical Rate Resistance Up',
    [bType.DOWN_CRITICAL_STAR_DAMAGE_TAKEN]: 'C. Star Drop Resistance Up',
    [bType.DOWN_CRITICALPOINT]: 'C. Star Drop Rate Down',
    [bType.DOWN_CRITICALRATE]: 'Critical Rate Down',
    [bType.DOWN_DAMAGE]: 'Special Damage Down',
    [bType.DOWN_DAMAGEDROPNP]: 'NP Gain When Damaged Down',
    [bType.DOWN_DEFENCE]: 'DEF Down',
    [bType.DOWN_DEFENCECOMMANDALL]: 'Resistance Down',
    [bType.DOWN_GRANTSTATE]: `Buff Chance Down`,
    [bType.DOWN_TOLERANCE]: 'Debuff Resist Down',
    [bType.DOWN_TOLERANCE_SUBSTATE]: 'Cleanse Resist Down',
    [bType.DOWN_NPDAMAGE]: `NP Damage Down`,
    [bType.ENTRY_FUNCTION]: 'Trigger skill on entry',
    [bType.FIELD_INDIVIDUALITY]: 'Change Field Type',
    [bType.GUTS]: 'Guts',
    [bType.INVINCIBLE]: 'Invincible',
    [bType.MULTIATTACK]: 'Multiple hits',
    [bType.NONE]: 'None',
    [bType.OVERWRITE_BATTLECLASS]: 'Change Class affinity',
    [bType.PIERCE_DEFENCE]: 'Ignore Defense Up',
    [bType.PIERCE_INVINCIBLE]: 'Ignore Invincible',
    [bType.REDUCE_HP]: 'Reduce HP per turn',
    [bType.REGAIN_HP]: 'HP gain per turn',
    [bType.REGAIN_NP]: 'NP gain per turn',
    [bType.REGAIN_STAR]: 'Stars gain per turn',
    [bType.SELFTURNEND_FUNCTION]: 'Trigger Skill every Turn',
    [bType.SKILL_RANK_UP]: 'Skill Rank Up',
    [bType.SPECIAL_INVINCIBLE]: 'Special Invincible',
    [bType.SUB_SELFDAMAGE]: 'Damage Cut',
    [bType.TD_TYPE_CHANGE]: 'Change Noble Phantasm',
    [bType.UP_ATK]: 'ATK Up',
    [bType.UP_CHAGETD]: 'Overcharge Up',
    [bType.UP_COMMANDALL]: 'Effectiveness Up',
    [bType.UP_COMMANDATK]: 'ATK Up',
    [bType.UP_COMMANDNP]: 'NP Damage Up',
    [bType.UP_CRITICALDAMAGE]: 'Critical Damage Up',
    [bType.UP_CRITICALPOINT]: 'C. Star Drop Rate Up',
    [bType.UP_CRITICALRATE]: 'Critical Rate Up',
    [bType.UP_DAMAGE]: 'Special Damage Up',
    [bType.UP_DAMAGE_EVENT_POINT]: 'Damage Up based on Event Point',
    [bType.UP_DAMAGEDROPNP]: 'NP Gain When Damaged Up',
    [bType.UP_DAMAGE_INDIVIDUALITY_ACTIVEONLY]: 'Special Damage Plus',
    [bType.UP_DEFENCE]: `DEF Up`,
    [bType.UP_DROPNP]: 'NP Gain Up',
    [bType.UP_GAIN_HP]: 'Healing Up',
    [bType.UP_GIVEGAIN_HP]: 'Healing Up',
    [bType.UP_GRANTSTATE]: `Buff Chance Up`,
    [bType.UP_NPDAMAGE]: 'NP Damage Up',
    [bType.UP_HATE]: 'Taunt',
    [bType.UP_MAXHP]: 'Increase Max HP by percentage',
    [bType.UP_NONRESIST_INSTANTDEATH]: 'Death Resist Down',
    [bType.UP_RESIST_INSTANTDEATH]: 'Instant Death Resistance Up',
    [bType.UP_STARWEIGHT]: 'Star Weight Up',
    [bType.UP_TOLERANCE]: 'Debuff Resist Up',
    [bType.UP_TOLERANCE_SUBSTATE]: 'Cleanse Resist Up'
}

export const ValsType = {
    [vType.Rate]: 'Probability',
    [vType.Value]: 'Value',
    [vType.Turn]: 'Turn',
    [vType.Count]: 'Time'
}

export const ValsKey = {
    [vType.Rate]: 'Rate',
    [vType.UseRate]: 'UseRate',
    [vType.Value]: 'Value',
    [vType.Value2]: 'Value2',
    [vType.Target]: 'Target',
    [vType.Correction]: 'Correction',
    [vType.Count]: 'Count',
    [vType.Turn]: 'Turn'
}