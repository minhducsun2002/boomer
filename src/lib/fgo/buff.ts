import { Buff, CardModifier, ValsType as vType } from '@pepper/constants/fgo';
import { ValsType, Trait, ValsKey } from '@pepper/constants/fgo/strings';
import type { mstBuff } from '@pepper/db/fgo/master/mstBuff';
import type { EmbedRenderer } from './renderer';
import { deduplicate } from '@pepper/utils';

// serializeValue is for cases when we want to provide a "recommended" method of serializing .value values into a string.
export type BuffEntry = { name: string, value: string[], serializeValue?: () => string };
export function renderTurn(s : string[]) : BuffEntry {
    // only handle turns > 0
    if (s.some(_ => +_ > 0)) return {
        name: ValsType[vType.Turn],
        value: s
    };
}

export function renderCount(s : string[], tenfold = true) : BuffEntry {
    if (s.some(_ => +_ > 0)) return {
        name: ValsType[vType.Count],
        value: s.map(_ => `${tenfold ? (+_ / 10) : _}`)
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

    _.chance = renderChance(val.get(ValsKey[vType.Rate]) || val.get(ValsKey[vType.UseRate]))?.value;
    _.turn = renderTurn(val.get(ValsKey[vType.Turn]))?.value;
    let count = (tenfold = true) => _.count = renderCount(val.get(ValsKey[vType.Count]), tenfold)?.value;

    // bond CEs' effects require target servants to stay on field
    _.onField = val.get("OnField");
    let conditions = buff.ckSelfIndv.map(_ => Trait[_ as keyof typeof Trait]);

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
        case Buff.UP_GRANT_INSTANTDEATH:
        case Buff.UP_FUNC_HP_REDUCE:
        case Buff.UP_ATK:           case Buff.DOWN_ATK:
        case Buff.UP_TOLERANCE_SUBSTATE:
        case Buff.GUTS_RATIO:
        case Buff.DOWN_DEFENCECOMMANDALL:
            count(false);
            _.amount = val.get(ValsKey[vType.Value]).map(_ => `${(+_ / 10)}%`);
            break;
        case Buff.REDUCE_HP:        case Buff.REGAIN_HP:
        case Buff.GUTS:
        case Buff.UP_CHAGETD:
            count(false);
            _.amount = val.get(ValsKey[vType.Value]);
            break;
        case Buff.AVOID_INSTANTDEATH:
            count();
            break;
        case Buff.REGAIN_NP:
            _.amount = val.get(ValsKey[vType.Value]).map(_ => `${(+_ / 100)}%`);
            break;
        case Buff.ADD_DAMAGE:       case Buff.DOWN_DAMAGE:
        case Buff.REGAIN_STAR:
        case Buff.UP_DAMAGE_INDIVIDUALITY_ACTIVEONLY:
        case Buff.ADD_MAXHP:        case Buff.SUB_MAXHP:
        case Buff.OVERWRITE_CLASSRELATIO_ATK:
        case Buff.SUB_SELFDAMAGE:
            _.amount = val.get(ValsKey[vType.Value]);
            break;
        case Buff.COMMANDATTACK_FUNCTION:
        case Buff.DEAD_FUNCTION:
        case Buff.DELAY_FUNCTION:
        case Buff.ENTRY_FUNCTION:
        case Buff.GUTS_FUNCTION:
        case Buff.NPATTACK_PREV_BUFF:
        case Buff.SELFTURNEND_FUNCTION:
            let skills = val.get("SkillID") || val.get(ValsKey[vType.Value]);
            let skillText = skills.map(async (skillId, i) => {
                // if there's Value2, that indicates levels
                let levels = val.get(ValsKey[vType.Value2]);
                let level = (levels || [])[i] || '1';
                let effect = await renderer.renderSkill(+skillId, {
                    side: true, chance: false, level: (levels?.length > 1 ? undefined : (+level) - 1)
                })
                return effect.value;
            });
            let value = (await Promise.all(skillText))
                // skills might have similar effects
                .map(({}, effectIndex, arr) => deduplicate(arr.map(effectList => effectList[effectIndex])).join('\n'))
                .filter(Boolean);
            value[0] = '\n' + value[0];
            out.push({
                name: `Trigger skill on ${
                    (conditions.length ? conditions : ['all cases']).join('/')
                }`,
                value,
                serializeValue: () => value.join('\n')
            });
            break;
        case Buff.AVOIDANCE:
        case Buff.INVINCIBLE:
            count(false);
            break;
        case Buff.CHANGE_COMMAND_CARD_TYPE:
            out.push({
                name: 'Change all Command Cards of the target to',
                value: val.get(ValsKey[vType.Value])?.map(card => Trait[+ card + CardModifier as keyof typeof Trait])
            });
            break;
        case Buff.ADD_INDIVIDUALITY:
            _.amount = val.get(ValsKey[vType.Value]).map(value => Trait[+value as keyof typeof Trait]);
            break;
        case Buff.AVOID_STATE:
        case Buff.DONOT_SKILL:
    };
    _.other = out;
    return _;
}