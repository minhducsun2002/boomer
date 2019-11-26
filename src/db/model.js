const { Schema, model } = require('mongoose');

const ServantStat = new Schema({
    hp: [Number],
    atk: [Number]
    // base : [0], max : [89/79/69], grailed : [99]
})

const Material = new Schema({ name: String, icon: String })
const MaterialSet = new Schema({ material: Material, amount: Number })

const AscensionLevel = new Schema({ qp: Number, material: [MaterialSet] });
const SkillLevel = new Schema({ qp: Number, material: [MaterialSet] });

const ActiveSkillEffect = new Schema({ effectName: String, effectStrength: [String] });
const ActiveSkill = new Schema({
    name: String,
    rank: String,
    detail: String,
    condition: String,
    records: [ActiveSkillEffect],
    // for each level, there exists a record of statistics
    icon: String,
    // thumbnail
    cooldown: [Number]
})

const PassiveSkill = new Schema({
    name: String,
    rank: String,
    detail: String,
    icon: String
})


const NoblePhantasmEffect = new Schema({ effectName: String, effectStrength: [String] });
const NoblePhantasm = new Schema({
     name: String,
     extendedName: String,
     rank: String,
     detail: String,
     class: String,
     hitcount: Number,
     overchargeDetail: String,
     records: [NoblePhantasmEffect],
     overchargeRecords : [NoblePhantasmEffect],
     condition: String
})

const Hitcount = new Schema({ buster: Number, quick: Number, arts: Number, extra: Number, np: Number })
const CardSet = new Schema({ buster: Number, quick: Number, arts: Number });
const DmgDistribution = new Schema({ buster: [Number], quick: [Number], arts: [Number], extra: [Number], np: [Number] })

const BondCE = new Schema({ name: String, effect: String, icon: String });
const Parameters = new Schema({ strength: String, agility: String, luck: String, endurance: String, mp: String, np: String })

const Servant = new Schema({
    name: String,
    // name
    alias: [String],
    // name + aliases for search
    class: String,
    // class
    stats: ServantStat,
    arts: [String],
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

    ascension: [AscensionLevel],
    activeSkillMaterial: [SkillLevel],
    activeSkill: [[ActiveSkill]],
    // three Skill arrays; each array contains 1 or more skill in case of upgrades,
    passiveSkill: [PassiveSkill],
    noblePhantasm: [NoblePhantasm],
    // an array of NP containing 1 or more depending on upgrades

    npGainStat: [String],
    // [perHit, whenAttacked]
    criticalStat: [String],
    // [absorption, genPerHit]
    cardSet: CardSet,

    hitcount: Hitcount,
    dmgDistribution: DmgDistribution,
    bond: [Number],
    // bond levels

    bondCE: BondCE,
    traits: [String],

    releaseDate: String
})

module.exports = { Servant, ServantModel: model('Servant', Servant) }
