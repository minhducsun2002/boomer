import { FGO } from '../../db/index'
import { mstQuestPhase as _ } from '../../db/fgo/master/mstQuestPhase';
import { truthify } from '../removeNull';

const { NA, JP } = FGO;

export type mstQuestPhase = _;
export function constructQuery(opt: Partial<mstQuestPhase>, limit: number = 1) {
    truthify(opt);
    return {
        JP: JP.mstQuestPhase.find(opt).limit(limit),
        NA: NA.mstQuestPhase.find(opt).limit(limit)
    }
}
