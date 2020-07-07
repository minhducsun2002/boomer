import { FGO } from '../../db/index'
import { mstTreasureDeviceLv as _ } from '../../db/fgo/master/mstTreasureDeviceLv';
import { truthify } from '../removeNull';

const { NA, JP } = FGO;

export type mstTreasureDeviceLv = _;
export function constructQuery(opt: Partial<mstTreasureDeviceLv>, limit: number = 1) {
    truthify(opt);
    return {
        JP: JP.mstTreasureDeviceLv.find(opt).limit(limit),
        NA: NA.mstTreasureDeviceLv.find(opt).limit(limit)
    }
}
