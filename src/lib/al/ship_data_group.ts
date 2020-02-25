import { interfaces as i } from '../../db/al'
import { AL } from '../../db';

const { models: m } = AL;
export type _interface = i['ship_data_group']

const l = (l : keyof typeof m) =>
    (opts : Partial<_interface>, limit : number = 1) => {
        return m[l].ship_data_group.find(opts).limit(limit) 
    }

export const c = {
    'en-US': l('en-US'),
    'zh-CN': l('zh-CN')
}