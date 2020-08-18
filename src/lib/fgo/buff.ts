import { Buff, ValsType as vType } from '@pepper/constants/fgo';
import { ValsType, Trait, ValsKey } from '@pepper/constants/fgo/strings';
import type { mstBuff } from '@pepper/db/fgo/master/mstBuff';
import { renderInvocation } from './func';
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

/**
 * Render a buff with zipped vals into statistics.
 */
export async function renderBuffStatistics(buff : mstBuff, val : Map<string, string[]>, db : DBInstance) {
    let out = [] as { name: string, value: string[] }[];
        // len = val.get(val.keys().next().value).length;
    switch (buff.type) {
        case Buff.UP_TOLERANCE:     case Buff.DOWN_TOLERANCE:
        case Buff.UP_COMMANDALL:
        case Buff.UP_GRANTSTATE:    case Buff.DOWN_GRANTSTATE:
        case Buff.UP_CRITICALPOINT: case Buff.DOWN_CRITICALPOINT:
        case Buff.UP_CRITICALRATE:  case Buff.DOWN_CRITICALRATE:
        case Buff.UP_CRITICALDAMAGE:case Buff.DOWN_CRITICALDAMAGE:
            // for (let i = 0 ; i < len ; i++) {
                out = out.concat([
                    {
                        name: ValsType[vType.Value],
                        value: val.get(ValsKey[vType.Value]).map(_ => `**${(+_ / 10)}**%`)
                    },
                    {
                        name: ValsType[vType.Rate],
                        value: val.get(ValsKey[vType.Rate]).map(_ => `**${(+_ / 10)}**%`)
                    }
                ]);
            // };
            return out;
        case Buff.AVOID_INSTANTDEATH:
            // for (let i = 0 ; i < len ; i++)
                out = out.concat([
                    {
                        name: ValsType[vType.Rate],
                        value: val.get(ValsKey[vType.Rate]).map(_ => `**${(+_ / 10)}**%`)
                    }
                ]);
                if (+val.get(ValsKey[vType.Turn])[0] > 0)
                    out.push({
                        name: ValsType[vType.Turn],
                        value: val.get(ValsKey[vType.Turn]).map(_ => `**${(+_ / 10)}**%`)
                    });
                if (+val.get(ValsKey[vType.Count])[0] > 0)
                    out.push({
                        name: ValsType[vType.Count],
                        value: val.get(ValsKey[vType.Count]).map(_ => `**${(+_ / 10)}**%`)
                    });
            return out;
        case Buff.ADD_DAMAGE:       case Buff.DOWN_DAMAGE:
            // for (let i = 0 ; i < len ; i++) 
                out = out.concat([
                    {
                        name: ValsType[vType.Value],
                        value: val.get(ValsKey[vType.Value]).map(_ => `**${_}**%`)
                    },
                    {
                        name: ValsType[vType.Rate],
                        value: val.get(ValsKey[vType.Rate]).map(_ => `**${(+_ / 10)}**%`)
                    }
                ]);
            return out;
        case Buff.COMMANDATTACK_FUNCTION:
            let conditions = buff.ckSelfIndv.map(_ => Trait[_ as keyof typeof Trait]);
            out.push({
                name: ValsType[vType.Rate],
                value: val.get("Rate").map(_ => `**${(+_ / 10)}**%`)
            });
            {
                let skills = val.get(ValsKey[vType.Value]).map(async (_sk, i) => {
                    let skill = await db.mstSkillLv.findOne({ skillId: +_sk }).exec();
                    let f = await renderInvocation(
                        await db.mstFunc.findOne({ id: skill.funcId[0] }).exec(), db
                    );
                    let funcName = `${f.action} ${f.targets.map(a => `[${a.trim()}]`).join(', ')}`
                    return `__[${funcName.trim()}] on **${f.affectTarget}**`
                    + (f.onTeam ? ` (**${f.onTeam}** team)` : '')
                    + `\n  ${ValsType[vType.Rate]} : **${+val.get(ValsKey[vType.UseRate])[i] / 10}**%__`
                });
                let value = await Promise.all(skills);
                value[0] += `\n`;
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