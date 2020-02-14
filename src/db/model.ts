import { Schema, Document, model, Model } from 'mongoose';

export interface ServantStat { hp: Number[], atk: Number[] }
const ServantStatModel: Schema<ServantStat> = new Schema({ hp: [Number], atk: [Number] })
// base : [0], max : [89/79/69], grailed : [99]

export interface Material { name: String, icon: String }
export interface MaterialSet { material: Material, amount: Number }

const MaterialModel: Schema<Material> = new Schema({ name: String, icon: String })
const MaterialSetModel: Schema<MaterialSet> = new Schema({ material: MaterialModel, amount: Number })

export interface AscensionLevel { qp: Number, material: MaterialSet[] }
export interface SkillLevel { qp: Number, material: MaterialSet[] }
const AscensionLevelModel: Schema<AscensionLevel> = new Schema({ qp: Number, material: [MaterialSetModel] });
const SkillLevelModel: Schema<SkillLevel> = new Schema({ qp: Number, material: [MaterialSetModel] });

export interface ActiveSkillEffect { effectName: String, effectStrength: String[] }
export interface ActiveSkill {
    name: String,
    rank: String,
    detail: String,
    condition: String,
    records: ActiveSkillEffect[],
    // for each level, there exists a record of statistics
    icon: String,
    // thumbnail
    cooldown: Number[]
}
const ActiveSkillEffectModel: Schema<ActiveSkillEffect> = new Schema({ effectName: String, effectStrength: [String] });
const ActiveSkillModel: Schema<ActiveSkill> = new Schema({
    name: String,
    rank: String,
    detail: String,
    condition: String,
    records: [ActiveSkillEffectModel],
    icon: String,
    cooldown: [Number]
})

export interface PassiveSkill { name: String, rank: String, detail: String, icon: String }
const PassiveSkillModel: Schema<PassiveSkill> = new Schema({
    name: String,
    rank: String,
    detail: String,
    icon: String
})

export interface NoblePhantasmEffect { effectName: String, effectStrength: String[] }
const NoblePhantasmEffectModel: Schema<NoblePhantasmEffect> = new Schema({ effectName: String, effectStrength: [String] });
export interface NoblePhantasm {
    name: String,
    extendedName: String,
    rank: String,
    detail: String,
    class: String,
    hitcount: Number,
    overchargeDetail: String,
    records: NoblePhantasmEffect[],
    overchargeRecords: NoblePhantasmEffect[],
    condition: String
}
const NoblePhantasmModel: Schema<NoblePhantasmEffect> = new Schema({
    name: String,
    extendedName: String,
    rank: String,
    detail: String,
    class: String,
    hitcount: Number,
    overchargeDetail: String,
    records: [NoblePhantasmEffectModel],
    overchargeRecords: [NoblePhantasmEffectModel],
    condition: String
})

export interface Hitcount { buster: Number, quick: Number, arts: Number, extra: Number, np: Number };
export interface CardSet { buster: Number, quick: Number, arts: Number }
export interface DmgDistribution { buster: Number[], quick: Number[], arts: Number[], extra: Number[], np: Number[] }
const HitcountModel: Schema<Hitcount> = new Schema({ buster: Number, quick: Number, arts: Number, extra: Number, np: Number })
const CardSetModel: Schema<CardSet> = new Schema({ buster: Number, quick: Number, arts: Number });
const DmgDistributionModel: Schema<DmgDistribution> = new Schema({ buster: [Number], quick: [Number], arts: [Number], extra: [Number], np: [Number] })

export interface BondCE { name: String, effect: String, icon: String }
export interface Parameters { strength: String, agility: String, luck: String, endurance: String, mp: String, np: String }
const BondCEModel: Schema<BondCE> = new Schema({ name: String, effect: String, icon: String });
const ParametersModel: Schema<Parameters> = new Schema({ strength: String, agility: String, luck: String, endurance: String, mp: String, np: String })


export interface Servant extends Document {
    name: String,
    // name
    alias: String[],
    // name + aliases for search
    class: String,
    // class
    stats: ServantStat,
    arts: String[],
    // link to stage arts
    id: Number,
    // internal game servant ID,
    rarity: Number,
    cost: Number,

    attribute: String,
    alignment: String,
    gender: String,
    origin: String,
    illustrator: String,
    voiceActor: String,
    series: String,

    parameters: Parameters,

    growth: String,
    instantDeathChance: String,

    ascension: AscensionLevel[],
    activeSkillMaterial: SkillLevel[],
    activeSkill: ActiveSkill[][],
    // three Skill arrays; each array contains 1 or more skill in case of upgrades,
    passiveSkill: PassiveSkill[],
    noblePhantasm: NoblePhantasm[],
    // an array of NP containing 1 or more depending on upgrades

    npGainStat: String[],
    // [perHit, whenAttacked]
    criticalStat: String[],
    // [absorption, genPerHit]
    cardSet: CardSet,

    hitcount: Hitcount,
    dmgDistribution: DmgDistribution,
    bond: Number[],
    // bond levels
    bondCE: BondCE,
    traits: String[],

    releaseDate: String
}
export const ServantSchema : Schema<Servant> = new Schema({
    name: String,
    alias: [String],
    class: String,
    stats: ServantStatModel,
    arts: [String],
    id: Number,
    rarity: Number,
    cost: Number,

    attribute: String,
    alignment: String,
    gender: String,
    origin: String,
    illustrator: String,
    voiceActor: String,
    series: String,

    parameters: ParametersModel,

    growth: String,
    instantDeathChance: String,

    ascension: [AscensionLevelModel],
    activeSkillMaterial: [SkillLevelModel],
    activeSkill: [[ActiveSkillModel]],
    passiveSkill: [PassiveSkillModel],
    noblePhantasm: [NoblePhantasmModel],

    npGainStat: [String],
    criticalStat: [String],
    cardSet: CardSetModel,

    hitcount: HitcountModel,
    dmgDistribution: DmgDistributionModel,
    bond: [Number],

    bondCE: BondCEModel,
    traits: [String],

    releaseDate: String
})