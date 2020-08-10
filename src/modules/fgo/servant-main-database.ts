import { FgoModule } from './base';
import { componentLog } from '@pepper/utils';
import { Schema, Document, createConnection, Model } from 'mongoose';
const string = String, number = Number;

interface MaterialSet { material: { name: string, icon: string }, amount: number }
const SkillLevelModel: Schema<{ qp: Number, material: MaterialSet[] }> = new Schema({
    qp: number,
    material: [new Schema({
        material: new Schema({ name: string, icon: string }),
        amount: number
    })]
});

interface ActiveSkill {
    name: string,
    rank: string,
    detail: string,
    condition: string,
    records: { effectName: string, effectStrength: string[] }[],
    // for each level, there exists a record of statistics
    icon: string,
    // thumbnail
    cooldown: number[]
}
const ActiveSkillModel: Schema<ActiveSkill> = new Schema({
    name: string,
    rank: string,
    detail: string,
    condition: string,
    records: [new Schema({ effectName: string, effectStrength: [string] })],
    icon: string,
    cooldown: [number]
})

interface NoblePhantasmEffect { effectName: string, effectStrength: string[] }
interface NoblePhantasm {
    name: string,
    extendedName: string,
    rank: string,
    detail: string,
    class: string,
    hitcount: number,
    overchargeDetail: string,
    records: NoblePhantasmEffect[],
    overchargeRecords: NoblePhantasmEffect[],
    condition: string
}
const NoblePhantasmModel: Schema<NoblePhantasmEffect> = new Schema({
    name: string,
    extendedName: string,
    rank: string,
    detail: string,
    class: string,
    hitcount: number,
    overchargeDetail: string,
    records: [new Schema({ effectName: string, effectStrength: [string] })],
    overchargeRecords: [new Schema({ effectName: string, effectStrength: [string] })],
    condition: string
})

export interface Servant extends Document {
    name: string,
    // name
    alias: string[],
    // name + aliases for search
    class: string,
    // class
    stats: { hp: number[], atk: number[] },
    arts: string[],
    // link to stage arts
    id: number,
    // internal game servant ID,
    rarity: number,
    cost: number,

    attribute: string,
    alignment: string,
    gender: string,
    origin: string,
    illustrator: string,
    voiceActor: string,
    series: string,

    parameters: { strength: string, agility: string, luck: string, endurance: string, mp: string, np: string },

    growth: string,
    instantDeathChance: string,

    ascension: { qp: number, material: MaterialSet[] }[],
    activeSkillMaterial: { qp: number, material: MaterialSet[] }[],
    activeSkill: ActiveSkill[][],
    // three Skill arrays; each array contains 1 or more skill in case of upgrades,
    passiveSkill: { name: string, rank: string, detail: string, icon: string }[],
    noblePhantasm: NoblePhantasm[],
    // an array of NP containing 1 or more depending on upgrades

    npGainStat: string[],
    // [perHit, whenAttacked]
    criticalStat: string[],
    // [absorption, genPerHit]
    cardSet: { buster: number, quick: number, arts: number },

    hitcount: { buster: number, quick: number, arts: number, extra: number, np: number },
    dmgDistribution: { buster: number[], quick: number[], arts: number[], extra: number[], np: number[] },
    bond: number[],
    // bond levels
    bondCE: { name: string, effect: string, icon: string },
    traits: string[],

    releaseDate: string
}
const ServantSchema : Schema<Servant> = new Schema({
    name: string,
    alias: [string],
    class: string,
    stats: new Schema({ hp: [number], atk: [number] }),
    arts: [string],
    id: number,
    rarity: number,
    cost: number,

    attribute: string,
    alignment: string,
    gender: string,
    origin: string,
    illustrator: string,
    voiceActor: string,
    series: string,

    parameters: new Schema({ strength: string, agility: string, luck: string, endurance: string, mp: string, np: string }),

    growth: string,
    instantDeathChance: string,

    ascension: [new Schema({
        qp: number,
        material: [new Schema({ material: new Schema({ name: string, icon: string }), amount: number })] })
    ],
    activeSkillMaterial: [SkillLevelModel],
    activeSkill: [[ActiveSkillModel]],
    passiveSkill: [
        new Schema({
            name: string, rank: string, detail: string, icon: string
        })
    ],
    noblePhantasm: [NoblePhantasmModel],

    npGainStat: [string],
    criticalStat: [string],
    cardSet: new Schema({ buster: number, quick: number, arts: number }),

    hitcount: new Schema({ buster: number, quick: number, arts: number, extra: number, np: number }),
    dmgDistribution: new Schema({ buster: [number], quick: [number], arts: [number], extra: [number], np: [number] }),
    bond: [number],

    bondCE: new Schema({ name: string, effect: string, icon: string }),
    traits: [string],

    releaseDate: string
})

export default class extends FgoModule {
    constructor() {
        super(`servant-main-database`, {});
    }

    private log = new componentLog(`F/GO servant main database`);
    private mod : Model<Servant>;

    get(id : number) {
        return this.mod.findOne({ id }).exec();
    }

    ids() : Promise<{ id: number }[]> {
        return this.mod.find({}).select('id').exec();
    }

    async initialize() {}
    async onload() {
        let { main } = this.client.config.database.fgo as { [k: string]: string };
        this.mod = createConnection(main)
            .on('open', () => this.log.success(`Connected to main database.`))
            .model('Servant', ServantSchema);
    }
}