import { FuncType, ValsType as vType } from '@pepper/constants/fgo';
import { ValsKey as vKey } from '@pepper/constants/fgo/strings';

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

export function parseVals (s : string, f : FuncType) {
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
        values: ["AddCount"]
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
    else populate(["Rate", "Value", "Target"])
    if (EVENT_FUNCTIONS.has(f) || FRIEND_FUNCTIONS.add(FuncType.CLASS_DROP_UP).has(f)) 
        out.set(+out.get("Type1") === 1 ? "AddCount" : "RateCount", out.get("Exp1"));

    // delete intermediary values
    out.delete("Type1"); out.delete("Exp1");
    
    // keyed check
    for (let val of raw.filter(a => isNaN(+a)))
        out.set(...keyedArguments(val));
        
    return out;
}