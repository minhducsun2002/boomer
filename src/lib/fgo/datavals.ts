import { FuncType } from '@pepper/constants/fgo';

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
        // useRate & value2
        // dependFuncs
        // let vals = s.match(/DependFuncVals1:\[(\d+,?)+]/g)[0].replace('DependFuncVals1:', ''),
        //     fId = +JSON.parse(
        //         s.match(/DependFuncId1:\[(\d+,?)+]/g)[0].replace('DependFuncId1:', '')
        //     );
        // return {
        //     depends: {
        //         func: fId,
        //         vals: parse(
        //             JSON.parse(vals),
        //             (await NA.mstFunc.findOne({ id: fId }).exec()).funcType
        //         )
        //     }
        // }
    }
}