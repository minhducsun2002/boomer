import { FGO } from '../../db/index'
import { mstSvtSkill as _ } from '../../db/fgo/master/mstSvtSkill';
import { truthify } from '../removeNull';

const { NA, JP } = FGO;

export type mstSvtSkill = _;
export function constructQuery(opt: Partial<mstSvtSkill>, limit: number = 1) {
    truthify(opt);
    return {
        JP: JP.mstSvtSkill.find(opt).limit(limit),
        NA: NA.mstSvtSkill.find(opt).limit(limit)
    }
}
