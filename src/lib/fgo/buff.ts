import { Buff, ValsType as vType } from '@pepper/constants/fgo';
import { ValsType, Trait, ValsKey } from '@pepper/constants/fgo/strings';
import type { mstBuff } from '@pepper/db/fgo/master/mstBuff';
import type { EmbedRenderer } from './renderer';
import type { DBInstance } from '@pepper/db/fgo';

/**
 * Fetch a `mstBuff` by its ID.
 * @param id Buff ID
 */
export async function getBuffById(id: number, db : DBInstance) {
    let _ = await db.mstBuff.findOne({ id }).exec();
    if (_ === null) throw new Error(`Could not find any buff with ID ${id}. Is that a trait?`);
    return _;
}


export type BuffEntry = { name: string, value: string[] };
export function renderTurn(s : string[]) : BuffEntry {
    // only handle turns > 0
    if (s.some(_ => +_ > 0)) return {
        name: ValsType[vType.Turn],
        value: s.map(_ => `${(+_ / 10)}`)
    };
}

export function renderCount(s : string[]) : BuffEntry {
    if (s.some(_ => +_ > 0)) return {
        name: ValsType[vType.Count],
        value: s.map(_ => `${(+_ / 10)}`)
    }
}

export function renderChance(s : string[]) : BuffEntry {
    return {
        name: ValsType[vType.Rate],
        value: s.map(_ => `${(+_ / 10)}%`)
    }
}

export type Statistics = {
    // special fields, rendered differently
    // all of these can always be represented as buff entries
    chance: string[],
    turn: string[],
    count: string[],
    amount: string[],
    onField: string[],

    other: BuffEntry[]
};

/**
 * Render a buff with zipped vals into statistics.
 */
export async function renderBuffStatistics(buff : mstBuff, val : Map<string, string[]>, renderer : EmbedRenderer) {
    let out = [] as BuffEntry[];
    let _ = {} as Statistics;

    let chance = () => _.chance = renderChance(val.get(ValsKey[vType.Rate]) || val.get(ValsKey[vType.UseRate]))?.value;

    // bond CEs' effects require target servants to stay on field
    _.onField = val.get("OnField");
    switch (buff.type) {
        case Buff.UP_TOLERANCE:     case Buff.DOWN_TOLERANCE:
        case Buff.UP_COMMANDALL:    case Buff.DOWN_COMMANDALL:
        case Buff.UP_GRANTSTATE:    case Buff.DOWN_GRANTSTATE:
        case Buff.UP_CRITICALPOINT: case Buff.DOWN_CRITICALPOINT:
        case Buff.UP_CRITICALRATE:  case Buff.DOWN_CRITICALRATE:
        case Buff.UP_CRITICALDAMAGE:case Buff.DOWN_CRITICALDAMAGE:
        case Buff.UP_DAMAGE:        case Buff.DOWN_DAMAGE:
        case Buff.UP_GAIN_HP:       case Buff.DOWN_GAIN_HP:
        case Buff.UP_DEFENCE:       case Buff.DOWN_DEFENCE:
        case Buff.UP_GIVEGAIN_HP:
        case Buff.UP_DAMAGEDROPNP:  case Buff.DOWN_DAMAGEDROPNP:
        case Buff.UP_DROPNP:        case Buff.DOWN_DROPNP:
        case Buff.UP_RESIST_INSTANTDEATH:
        case Buff.UP_NPDAMAGE:      case Buff.DOWN_NPDAMAGE:
        case Buff.UP_COMMANDATK:    case Buff.DOWN_COMMANDATK:
        case Buff.UP_STARWEIGHT:    case Buff.DOWN_STARWEIGHT:
            chance();
            _.amount = val.get(ValsKey[vType.Value]).map(_ => `${(+_ / 10)}%`);
            break;
        case Buff.AVOID_INSTANTDEATH:
            chance();
            _.turn = renderTurn(val.get(ValsKey[vType.Turn]))?.value;
            _.count = renderCount(val.get(ValsKey[vType.Count]))?.value;
            break;
        case Buff.ADD_DAMAGE:       case Buff.DOWN_DAMAGE:
        case Buff.REGAIN_STAR:
        case Buff.UP_DAMAGE_INDIVIDUALITY_ACTIVEONLY:
            chance();
            _.amount = val.get(ValsKey[vType.Value]).map(_ => `${_}`);
            break;
        case Buff.COMMANDATTACK_FUNCTION:
        case Buff.DEAD_FUNCTION:
            chance();
            let conditions = buff.ckSelfIndv.map(_ => Trait[_ as keyof typeof Trait]);
            {
                let skills = val.get(ValsKey[vType.Value]).map(async (skillId, i) => {
                    // if there's Value2, that indicates levels
                    let level = (val.get(ValsKey[vType.Value2]) || [])[i] || '1';
                    let effect = await renderer.renderSkill_asSingleLevel(+skillId, {
                        showTeam: true, showChance: true, newline: false, addLink: false, level: (+level) - 1
                    })
                    return `__` + effect.value + `__`;
                });
                let value = await Promise.all(skills);
                value[0] = '\n' + value[0];
                out.push({
                    name: `Trigger skill on ${
                        (conditions.length ? conditions : ['all cases']).join('/')
                    }`,
                    value
                });
            };
            break;
        case Buff.AVOID_STATE:
            chance();
    };
    _.other = out;
    return _;
}