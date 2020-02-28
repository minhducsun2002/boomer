import { FGO } from '../../db/index'
import { mstSvtComment as _ } from '../../db/fgo/master/mstSvtComment';
import { truthify } from '../removeNull';

const { NA, JP } = FGO;

export type mstSvtComment = _;
export function constructQuery(opt: Partial<mstSvtComment>, limit: number = 1) {
    truthify(opt);
    return {
        JP: JP.mstSvtComment.find(opt).limit(limit),
        NA: NA.mstSvtComment.find(opt).limit(limit)
    }
}
