import { FGO } from '../../db/index'
import { mstAttriRelation as _ } from '../../db/fgo/master/mstAttriRelation';
import { truthify } from '../removeNull';

const { NA, JP } = FGO;

export type mstAttriRelation = _;
export function constructQuery(opt: Partial<mstAttriRelation>, limit: number = 1) {
    truthify(opt);
    return {
        JP: JP.mstAttriRelation.find(opt).limit(limit),
        NA: NA.mstAttriRelation.find(opt).limit(limit)
    }
}
