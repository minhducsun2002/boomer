import type { mstFunc } from '@pepper/db/fgo/master/mstFunc';
import type { mstBuff } from '@pepper/db/fgo/master/mstBuff';
import { getBuffById } from './buff';

import {
    ApplyTarget as aTgt,
    FuncTypes as fTp,
    TargetType as tTp,
    Trait as tr,
    BuffTypes as bTp
} from '@pepper/constants/fgo/strings';

export async function renderInvocation({
    vals, funcType, targetType, applyTarget, id, popupText, tvals
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
    buff = buff.filter(a => a);
    let action = fTp[funcType as keyof typeof fTp];
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
        traitVals: tvals.map(t => tr[t as keyof typeof tr]),
        /** Function ID. */
        id,
        /** Popup text in game when this function is invoked. */
        popupText,
        onTeam: teamApply,
        affectTarget: target,
        rawBuffs: buff as mstBuff[]
    }
}

// type guard for buffs without proper object (i.e. traits)
function isSimpleEffect(_ : mstBuff | { name: string, simple: number }) : _ is {
    name: string, simple: number
} {
    return (_ as mstBuff).type === undefined;
}
