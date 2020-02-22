import { interfaces as i } from '../../db/al'
import { AL } from '../../db/';

const { models: m } = AL;

type im = i['ship_data_by_type']

const l = (l : keyof typeof m) =>
    (opts : Partial<im>, limit : number = 1) => {
        return m[l].ship_data_by_type.find(opts).limit(limit) 
    }

export const c = {
    'en-US': l('en-US'),
    'zh-CN': l('zh-CN')
}