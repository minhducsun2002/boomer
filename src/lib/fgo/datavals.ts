import { FuncType, ValsType as vType } from '@pepper/constants/fgo';
import { ValsKey as vKey } from '@pepper/constants/fgo/strings'

function parse(_ : number[], f : FuncType) {
    switch (f) {
        case FuncType.DAMAGE_NP_INDIVIDUAL:
        case FuncType.DAMAGE_NP_STATE_INDIVIDUAL:
        case FuncType.DAMAGE_NP_STATE_INDIVIDUAL_FIX:
        case FuncType.DAMAGE_NP_INDIVIDUAL_SUM:
        case FuncType.DAMAGE_NP_RARE:
            return { Rate: _[0], Value: _[1], Target: _[2], Correction: _[3] };
        case FuncType.ADD_STATE:
        case FuncType.ADD_STATE_SHORT:
            return { Rate: _[0], Turn: _[1], Count: _[2], Value: _[3], UseRate: _[4], Value2: _[5] };
        case FuncType.SUB_STATE:
            return { Rate: _[0], Value: _[1], Value2: _[2] };
        default:
            return { Rate: _[0], Value: _[1], Target: _[2] };
    }
}

export type normalVals = ReturnType<typeof parse>;

export async function parseVals (s : string, f : FuncType) {
    try {
        return parse(JSON.parse(s), f);
    } catch {
        let raw = s.replace('[', '').replace(']', '').split(',');
        let v2 = raw.find(a => a.startsWith(`Value2:`)).replace(`Value2:`, ''),
            ur = raw.find(a => a.startsWith(`UseRate:`)).replace(`UseRate:`, '');
        s = s
            .replace(`Value2:${v2}`, '')
            .replace(`UseRate:${ur}`, '')
        while (s.endsWith(`,]`)) s = s.replace(',]', ']');
        return {
            ...parse(JSON.parse(s), f),
            UseRate: ur, Value2: v2
        }
    }
}

const EVENT_FUNCTIONS = new Set([
    FuncType.EVENT_POINT_UP,
    FuncType.EVENT_POINT_RATE_UP,
    FuncType.EVENT_DROP_UP,
    FuncType.EVENT_DROP_RATE_UP,
    FuncType.ENEMY_ENCOUNT_COPY_RATE_UP,
    FuncType.ENEMY_ENCOUNT_RATE_UP
]);

const FRIEND_FUNCTIONS = new Set([
    FuncType.SERVANT_FRIENDSHIP_UP,
    FuncType.USER_EQUIP_EXP_UP,
    FuncType.EXP_UP,
    FuncType.QP_DROP_UP,
    FuncType.QP_UP,
])

function keyedArguments (s : string) : [string, string] {
    if (!s.includes(':')) throw new Error(`${s} contains no value name!`);
    let [$, _] = s.split(':').filter(a => a);
    return [$, _];
}

export function parseVals_enhanced (s : string, f : FuncType) {
    let raw = s.replace('[', '').replace(']', '').split(',').filter(_ => _);
    let out = new Map<string, string>();
    
    let raw_clean = raw.filter(a => !isNaN(+a));

    // let populate = (s : string[]) => s.forEach((k, i) => out.set(k, raw_clean[i]));
    let populate = (s : string[]) => raw_clean.forEach((v, i) => out.set(s[i], v));

    let mappings = [{
        condition: [
            FuncType.DAMAGE_NP_INDIVIDUAL,
            FuncType.DAMAGE_NP_STATE_INDIVIDUAL,
            FuncType.DAMAGE_NP_STATE_INDIVIDUAL_FIX,
            FuncType.DAMAGE_NP_INDIVIDUAL_SUM,
            FuncType.DAMAGE_NP_RARE
        ],
        values: [vKey[vType.Rate], vKey[vType.Value], vKey[vType.Target], vKey[vType.Correction]]
    }, {
        condition: [FuncType.ADD_STATE, FuncType.ADD_STATE_SHORT],
        values: [vKey[vType.Rate], vKey[vType.Turn], vKey[vType.Count], vKey[vType.Value], vKey[vType.UseRate], vKey[vType.Value2]]
    }, {
        condition: [FuncType.SUB_STATE],
        values: [vKey[vType.Rate], vKey[vType.Value], vKey[vType.Value2]]
    }, {
        condition: [FuncType.ENEMY_PROB_DOWN],
        values: ["Individuality", "RateCount", "EventId"]
    }, {
        condition: [FuncType.FRIEND_POINT_UP, FuncType.FRIEND_POINT_UP_DUPLICATE],
        value: ["AddCount"]
    }, {
        condition: [...EVENT_FUNCTIONS],
        values: ["Individuality", "Type1", "Exp1", "EventId"]
    }, {
        condition: [FuncType.CLASS_DROP_UP],
        values: ["Type1", "Exp1", "EventId"]
    }, {
        condition: [...FRIEND_FUNCTIONS],
        values: ["Type1", "Exp1", "Individuality"]
    }]

    let match = mappings.find(a => a.condition.includes(f));
    if (match) populate(match.values);
    if (EVENT_FUNCTIONS.has(f) || FRIEND_FUNCTIONS.add(FuncType.CLASS_DROP_UP).has(f)) 
        out.set(+out.get("Type1") === 1 ? "AddCount" : "RateCount", out.get("Exp1"));

    // delete intermediary values
    out.delete("Type1"); out.delete("Exp1");
    
    // keyed check
    for (let val of raw.filter(a => isNaN(+a)))
        out.set(...keyedArguments(val));
        
    return out;
}