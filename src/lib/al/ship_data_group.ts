import { interfaces as i } from '../../db/al'
import { AL } from '../../db';

const { models: m } = AL;
export type _interface = i['ship_data_group']

const l = (l : keyof typeof m) =>
    (opts : Partial<_interface>, limit : number = 1) => {
        let _ = m[l].ship_data_group.find(opts).limit(limit);
        type out = typeof _;
        return (_ as any).cache() as out;
    }

export const c = {
    'en-US': l('en-US'),
    'zh-CN': l('zh-CN')
}