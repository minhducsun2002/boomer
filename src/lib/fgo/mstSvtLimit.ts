import { FGO } from '../../db/index'
import { mstSvtLimit as _ } from '../../db/fgo/master/mstSvtLimit';
import { truthify } from '../removeNull';

const { NA, JP } = FGO;

export type mstSvtLimit = _;
export function constructQuery(opt: Partial<mstSvtLimit>, limit: number = 1) {
    truthify(opt);
    return {
        JP: JP.mstSvtLimit.find(opt).limit(limit),
        NA: NA.mstSvtLimit.find(opt).limit(limit)
    }
}
