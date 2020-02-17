import { FGO } from '../../db/index'
import { mstQuest as _ } from '../../db/fgo/master/mstQuest';
import { truthify } from '../removeNull';
import f from '../querifySubstring'

const { NA, JP } = FGO;

export type mstQuest = _;
export function constructQuery(opt: Partial<mstQuest>, limit: number = 1) {
    truthify(opt);
    if (opt.name) opt.name = f(opt.name) as any as string;
    return {
        JP: JP.mstQuest.find(opt).limit(limit),
        NA: NA.mstQuest.find(opt).limit(limit)
    }
}
