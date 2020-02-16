import { FGO } from '../../db/index'
import { mstSvt as _ } from '../../db/fgo/master/mstSvt';
import { truthify } from '../removeNull';

const { NA, JP } = FGO;

export type mstSvt = _;
export function constructQuery(opt: Partial<mstSvt>, limit: number = 1) {
    truthify(opt);
    return {
        JP: JP.mstSvt.find(opt).limit(limit),
        NA: NA.mstSvt.find(opt).limit(limit)
    }
}
