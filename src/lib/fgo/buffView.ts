import { Buff } from '@pepper/constants/fgo';
import { ValueFields, Trait } from '@pepper/constants/fgo/strings';
import type { mstBuff } from '@pepper/db/fgo/master/mstBuff';
import type { normalVals } from './datavals';
import { renderInvocation } from './func';
import { JP as NA } from '@pepper/db/fgo';

// https://jpwilliams.dev/how-to-unpack-the-return-type-of-a-promise-in-typescript
// type Unwrap<T> =
// 	T extends Promise<infer U> ? U :
// 	T extends (...args: any) => Promise<infer U> ? U :
// 	T extends (...args: any) => infer U ? U :
// 	T

export type zippedNormalVals = {
    [k in keyof normalVals]: normalVals[k][];
};

/**
 * Render a buff with zipped vals into statistics.
 */
export async function renderBuffStatistics(buff : mstBuff, val : zippedNormalVals) {
    let out = [] as { name: string, value: string[] }[],
        len = val.Rate.length;
    switch (buff.type) {
        case Buff.UP_TOLERANCE:     case Buff.DOWN_TOLERANCE:
        case Buff.UP_COMMANDALL:
        case Buff.UP_GRANTSTATE:    case Buff.DOWN_GRANTSTATE:
        case Buff.UP_CRITICALPOINT: case Buff.DOWN_CRITICALPOINT:
        case Buff.UP_CRITICALRATE:  case Buff.DOWN_CRITICALRATE:
        case Buff.UP_CRITICALDAMAGE:case Buff.DOWN_CRITICALDAMAGE:
            for (let i = 0 ; i < len ; i++) {
                out = out.concat([
                    {
                        name: ValueFields.VALUE,
                        value: val.Value.map(_ => `**${(_ / 10)}**%`)
                    },
                    {
                        name: ValueFields.RATE,
                        value: val.Rate.map(_ => `**${(_ / 10)}**%`)
                    }
                ]);
            };
            return out;   
        case Buff.ADD_DAMAGE:       case Buff.DOWN_DAMAGE:
            for (let i = 0 ; i < len ; i++) 
                out = out.concat([
                    {
                        name: ValueFields.VALUE,
                        value: val.Value.map(_ => `**${_}**%`)
                    },
                    {
                        name: ValueFields.RATE,
                        value: val.Rate.map(_ => `**${(_ / 10)}**%`)
                    }
                ]);
            return out;
        case Buff.COMMANDATTACK_FUNCTION:
            let conditions = buff.ckSelfIndv.map(_ => Trait[_ as keyof typeof Trait]);
            out.push({
                name: ValueFields.RATE,
                value: val.Rate.map(_ => `**${(_ / 10)}**%`)
            });
            {
                let skills = val.Value.map(async (skillId, i) => {
                    let skill = await NA.mstSkillLv.findOne({ skillId }).exec();
                    let f = await renderInvocation(
                        await NA.mstFunc.findOne({ id: skill.funcId[0] }).exec()
                    );
                    let funcName = `${f.action} ${f.targets.map(a => `[${a.trim()}]`).join(', ')}`
                    return `__[${funcName.trim()}] on **${f.affectTarget}** (**${f.affectWhenOnTeam}** team)`
                    + `\n  ${ValueFields.RATE} : **${val.UseRate[i] / 10}**%__`
                });
                let value = await Promise.all(skills);
                value[0] = `\n` + value[0];
                out.push({
                    name: `Trigger skill on ${
                        (conditions.length ? conditions : ['all cases']).join('/')
                    }`,
                    value
                });
            }
            return out;
        default:
            return out;
    }
}