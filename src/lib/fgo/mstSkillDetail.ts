import { FGO } from '../../db/index'
import { mstSkillDetail as _ } from '../../db/fgo/master/mstSkillDetail';
import { truthify } from '../removeNull';

const { NA, JP } = FGO;

export type mstSkillDetail = _;
export function constructQuery(opt: Partial<mstSkillDetail>, limit: number = 1) {
    truthify(opt);
    return {
        JP: JP.mstSkillDetail.find(opt).limit(limit),
        NA: NA.mstSkillDetail.find(opt).limit(limit)
    }
}
