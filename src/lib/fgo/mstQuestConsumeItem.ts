import { FGO } from '../../db/index'
import { mstQuestConsumeItem as _ } from '../../db/fgo/master/mstQuestConsumeItem';
import { truthify } from '../removeNull';

const { NA, JP } = FGO;

export type mstQuestConsumeItem = _;
export function constructQuery(opt: Partial<mstQuestConsumeItem>, limit: number = 1) {
    truthify(opt);
    return {
        JP: JP.mstQuestConsumeItem.find(opt).limit(limit),
        NA: NA.mstQuestConsumeItem.find(opt).limit(limit)
    }
}
