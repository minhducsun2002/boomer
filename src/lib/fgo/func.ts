import type { mstFunc } from '@pepper/db/fgo/master/mstFunc';
import { getBuffById } from './buff';

type ReturnTypePromise<T> = T extends (...args: any[]) => Promise<infer R> ? R : never;
type Buff = ReturnTypePromise<typeof getBuffById>;

import {
    ApplyTarget as aTgt,
    FuncTypes as fTp,
    TargetType as tTp
} from '@pepper/constants/fgo/strings';

export async function renderInvocation({
    vals, funcType, targetType, applyTarget, id, popupText
} : mstFunc) {
    // list of buff IDs
    let teamApply = aTgt[applyTarget],
        target = tTp[targetType];
    let buff = await Promise.all(
        vals.map(buffId => getBuffById(buffId).catch(() => null as Buff))
    );
    // ignore the traits?
    buff = buff.filter(a => a)
    let action = fTp[funcType as keyof typeof fTp];
    let buff_desc = buff.map(a => a.name);
    return {
        /** Action that this function executes. Should map to `FuncType`. */
        action,
        /** Buffs that this action grants. Should be buff names, if any. */
        targets: buff_desc,
        /** Function ID. */
        id,
        /** Popup text in game when this function is invoked. */
        popupText,
        affectWhenOnTeam: teamApply,
        affectTarget: target
    }
    // if (buff)
}