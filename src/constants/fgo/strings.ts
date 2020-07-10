import {
    GenderType,
    Trait as t,
    FuncType as fType,
    TargetType as tType,
    ApplyTarget as aType
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
    [t.canBeInBattle]: '',
    [t.cardArts]: '',
    [t.cardBuster]: '',
    [t.cardExtra]: '',
    [t.cardNP]: '',
    [t.cardQuick]: '',
    [t.centaur]: 'Centaur',
    [t.chimera]: 'Chimera',
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
    [t.genderCaenisServant]: 'Caenis',
    [t.genderFemale]: 'Female',
    [t.genderMale]: 'Male',
    [t.genderUnknown]: 'Unknown',
    [t.genderUnknownServant]: 'Unknown Servant',
    [t.humanoid]: 'Humanoid',
    [t.humanoidServant]: '',
    [t.illya]: 'Illya',
    [t.king]: 'King',
    [t.riding]: 'Riding',
    [t.saberface]: 'Saberface',
    [t.saberClassServant]: 'Saber-class Servant',
    [t.skyOrEarth]: 'Heaven or Earth',
    [t.skyOrEarthExceptPseudoAndDemi]: 'Heaven or Earth (except Pseudo-Servants & Demi-Servants)',
    [t.threatToHumanity]: 'Threat to Humanity',
    [t.weakToEnumaElish]: 'Weak to Enuma Elish',
}

export const FuncTypes = {
    [fType.ABSORB_NPTURN]: '',
    [fType.ADD_STATE]: 'Add state',
    [fType.ADD_STATE_SHORT]: 'Add state in 1 turn'
}

export const TargetType = {
    [tType.SELF]: 'self'
}

export const ApplyTarget = {
    [aType.ENEMY]: 'Enemy',
    [aType.PLAYER]: 'Player',
    [aType.PLAYER_AND_ENEMY]: 'Player & enemy'
}