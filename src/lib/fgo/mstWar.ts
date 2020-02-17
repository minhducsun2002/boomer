import { FGO } from '../../db/index'
import { mstWar as _ } from '../../db/fgo/master/mstWar';
import { truthify } from '../removeNull';

const { NA, JP } = FGO;

export type mstWar = _;
export function constructQuery(opt: Partial<mstWar>, limit: number = 1) {
    truthify(opt);
    return {
        JP: JP.mstWar.find(opt).limit(limit),
        NA: NA.mstWar.find(opt).limit(limit)
    }
}
