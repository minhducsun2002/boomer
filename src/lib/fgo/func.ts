import type { mstFunc } from '@pepper/db/fgo/master/mstFunc';
import type { mstBuff } from '@pepper/db/fgo/master/mstBuff';
import { getBuffById } from './buff';
import { ValsType as vType } from '@pepper/constants/fgo';
import { ValsKey as vKey, Trait } from '@pepper/constants/fgo/strings';
import { Statistics, renderChance, renderCount } from './buff';

import {
    ApplyTarget as aTgt,
    FuncTypes as fTp,
    TargetType as tTp,
    Trait as tr,
    BuffTypes as bTp
} from '@pepper/constants/fgo/strings';
import { FuncType } from '@pepper/constants/fgo';

export async function renderInvocation({
    vals, funcType, targetType, applyTarget, id, popupText, tvals, questTvals
} : mstFunc, db : Parameters<typeof getBuffById>[1]) {
    // list of buff IDs
    let teamApply = aTgt[applyTarget],
        target = tTp[targetType];
    let buff = await Promise.all(
        vals.map(buffId => getBuffById(buffId, db)
            .catch(() => ({ name: tr[buffId as keyof typeof tr], simple: 1 }))
        )
    );
    // ignore the traits?
    buff = buff.filter(a => !(a as any)?.simple);
    let action = fTp[funcType as keyof typeof fTp];
    // trait to determine eligibility
    let traitVals = tvals.map(t => tr[t as keyof typeof tr]);
    // trait to affect
    let traitToAffect : string[] = [];
    if (
        [
            FuncType.EVENT_DROP_UP,
            FuncType.SUB_STATE,
            FuncType.GAIN_NP_BUFF_INDIVIDUAL_SUM
        ]
            .includes(funcType)
    ) {
        traitToAffect = vals.map(t => tr[t as keyof typeof tr]);
        buff = [];
    }
    let fieldTraits = questTvals.map(trait => tr[trait as keyof typeof tr] || `${trait}`);
    return {
        /** Action that this function executes. Should map to `FuncType`. */
        action,
        /** Buffs that this action grants. Should be buff names, if any. */
        targets: buff.map(a => {
            if (isSimpleEffect(a)) return a.name;
            else {
                return `${bTp[a.type as keyof typeof bTp]}${
                    // buff elligibility for self
                    a.ckSelfIndv.length
                        ? ` for ${a.ckSelfIndv.map(t => tr[t as keyof typeof tr] || t).join(', ')}`
                        : ``
                }${
                    // buff elligibility for target
                    a.ckOpIndv.length
                        ? ` against ${a.ckOpIndv.map(t => tr[t as keyof typeof tr] || t).join(', ')}`
                        : ''
                }`
            }
        }),
        traitVals,
        traitToAffect,
        /** Traits that on fields with them, this function is allowed to invoke. */
        fieldTraits,
        /** Function ID. */
        id,
        /** Popup text in game when this function is invoked. */
        popupText,
        onTeam: teamApply,
        affectTarget: target,
        rawBuffs: buff as mstBuff[],
        rawType: funcType
    }
}

// type guard for buffs without proper object (i.e. traits)
function isSimpleEffect(_ : mstBuff | { name: string, simple: number }) : _ is {
    name: string, simple: number
} {
    return !!(_ as { simple: number })?.simple;
}

export function renderFunctionStatistics (f: FuncType, val : Map<string, string[]>) {
    let out = {} as Statistics;
    out.other = [];
    if (val.has('AddCount')) out.amount = val.get('AddCount');
    if (val.has(vKey[vType.Rate])) out.chance = renderChance(val.get(vKey[vType.Rate]))?.value;
    if (val.has(vKey[vType.Count])) out.amount = renderCount(val.get(vKey[vType.Count]))?.value;
    if (val.has(vKey[vType.Value])) {
        if ([FuncType.GAIN_NP, FuncType.LOSS_NP].includes(f))
            out.amount = val.get(vKey[vType.Value]).map(_ => `${(+_ / 100)}%`)
        if ([FuncType.GAIN_HP, FuncType.LOSS_HP, FuncType.LOSS_HP_SAFE, FuncType.GAIN_STAR, FuncType.SHORTEN_SKILL].includes(f))
            out.amount = val.get(vKey[vType.Value])
        if ([FuncType.DAMAGE_NP, FuncType.DAMAGE_NP_PIERCE].includes(f))
            out.amount = val.get(vKey[vType.Value]).map(_ => `${(+_ / 10)}%`)
        if ([FuncType.DAMAGE_NP_INDIVIDUAL, FuncType.DAMAGE_NP_STATE_INDIVIDUAL_FIX].includes(f)) {
            out.amount = val.get(vKey[vType.Value]).map(_ => `${(+_ / 10)}%`);
            let specialDamageValue = val.get(vKey[vType.Correction]).map(_ => `**${(+_ / 10)}%**`);
            out.other.push(
                {
                    // assumption that a target trait doesn't change ever, so we don't need to dedupe
                    name: `Special damage for ${Trait[+val.get(vKey[vType.Target])[0] as keyof typeof Trait]} targets`,
                    value: specialDamageValue,
                    serializeValue: () => specialDamageValue.join(' / ')
                }
            );
        }
        if (f === FuncType.DAMAGE_NP_INDIVIDUAL_SUM) {
            out.amount = val.get(vKey[vType.Value]).map(_ => `${(+_ / 10)}%`);
            let traits = val.get('TargetList')[0].split('/').map(t => Trait[+t as keyof typeof Trait]),
                specialDamageValue = val.get(vKey[vType.Value2]).map(_ => `**${(+_ / 10)}%**`),
                traitBasedSpecialDamageValue = val.get(vKey[vType.Correction]).map(_ => `**${(+_ / 10)}%**`),
                maxTraitCount = val.get('ParamAddMaxCount').map(_ => `**${_}**`);
            out.other.push({
                name: `Special damage for ${traits.join(' / ')} targets`,
                value: specialDamageValue,
                serializeValue: () => specialDamageValue.join(' / ')
            });
            out.other.push({
                name: `Added special damage per [${traits.join(' / ')}] trait`,
                value: traitBasedSpecialDamageValue,
                serializeValue: () => traitBasedSpecialDamageValue.join(' / ')
            })
            out.other.push({
                name: `Maximum amount of counted [${traits.join(' / ')}] traits`,
                value: maxTraitCount,
                serializeValue: () => maxTraitCount.join(' / ')
            })
        }

        if (f === FuncType.DAMAGE_NP_RARE) {
            out.amount = val.get(vKey[vType.Value]).map(_ => `${(+_ / 10)}%`);
            let rarities = val.get('TargetRarityList')[0].split('/');
            let specialDamageValue = val.get(vKey[vType.Correction]).map(_ => `**${(+_ / 10)}%**`);
            out.other.push({
                name: `Special damage for ${rarities.join('/')} rarity targets`,
                value: specialDamageValue,
                serializeValue: () => specialDamageValue.join(' / ')
            });
        }
    }
    return out;
}