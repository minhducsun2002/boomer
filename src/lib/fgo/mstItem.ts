import { FGO } from '../../db/index'
import { mstItem as _ } from '../../db/fgo/master/mstItem';
import { truthify } from '../removeNull';
import f from '../querifySubstring';

const { NA, JP } = FGO;

export type mstItem = _;
export function constructQuery(opt: Partial<mstItem>, limit: number = 1) {
    truthify(opt);
    if (opt.name) opt.name = f(opt.name) as any as string;
    return {
        JP: JP.mstItem.find(opt).limit(limit),
        NA: NA.mstItem.find(opt).limit(limit)
    }
}
