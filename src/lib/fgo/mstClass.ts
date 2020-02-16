import { FGO } from '../../db/index'
import { mstClass as _ } from '../../db/fgo/master/mstClass';
import { truthify } from '../removeNull';

const { NA, JP } = FGO;

export type mstClass = _;
export function constructQuery(opt: Partial<mstClass>, limit: number = 1) {
    truthify(opt);
    return {
        JP: JP.mstClass.find(opt).limit(limit),
        NA: NA.mstClass.find(opt).limit(limit)
    }
}
