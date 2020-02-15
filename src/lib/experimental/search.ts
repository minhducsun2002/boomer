import { mstSvtModel } from '../../db';
import { mstSvt as _ } from '../../db/master/mstSvt';
import { truthify } from '../removeNull';

export type mstSvt = _;
export function constructQuery(opt: Partial<mstSvt>, limit: number = 1) {
    truthify(opt);
    return {
        JP: mstSvtModel.JP.find(opt).limit(limit),
        NA: mstSvtModel.NA.find(opt).limit(limit)
    }
}
