import { FGO } from '../../db/index'
import { mstSvtTreasureDevice as _ } from '../../db/fgo/master/mstSvtTreasureDevice';
import { truthify } from '../removeNull';

const { NA, JP } = FGO;

export type mstSvtTreasureDevice = _;
export function constructQuery(opt: Partial<mstSvtTreasureDevice>, limit: number = 1) {
    truthify(opt);
    return {
        JP: JP.mstSvtTreasureDevice.find(opt).limit(limit),
        NA: NA.mstSvtTreasureDevice.find(opt).limit(limit)
    }
}
