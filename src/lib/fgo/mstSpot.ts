import { FGO } from '../../db/index'
import { mstSpot as _ } from '../../db/fgo/master/mstSpot';
import { truthify } from '../removeNull';

const { NA, JP } = FGO;

export type mstSpot = _;
export function constructQuery(opt: Partial<mstSpot>, limit: number = 1) {
    truthify(opt);
    return {
        JP: JP.mstSpot.find(opt).limit(limit),
        NA: NA.mstSpot.find(opt).limit(limit)
    }
}
