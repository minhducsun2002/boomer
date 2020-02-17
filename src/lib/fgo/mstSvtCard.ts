import { FGO } from '../../db/index'
import { mstSvtCard as _ } from '../../db/fgo/master/mstSvtCard';
import { truthify } from '../removeNull';

const { NA, JP } = FGO;

export type mstSvtCard = _;
export function constructQuery(opt: Partial<mstSvtCard>, limit: number = 1) {
    truthify(opt);
    return {
        JP: JP.mstSvtCard.find(opt).limit(limit),
        NA: NA.mstSvtCard.find(opt).limit(limit)
    }
}
