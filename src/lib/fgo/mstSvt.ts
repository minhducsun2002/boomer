import { FGO } from '../../db/index'
import { mstSvt as _ } from '../../db/fgo/master/mstSvt';
import { truthify } from '../removeNull';

const { mstSvtModel } = FGO;

export type mstSvt = _;
export function constructQuery(opt: Partial<mstSvt>, limit: number = 1) {
    truthify(opt);
    return {
        JP: mstSvtModel.JP.find(opt).limit(limit),
        NA: mstSvtModel.NA.find(opt).limit(limit)
    }
}
