import { interfaces as i } from '../../db/al'
import { AL } from '../../db/';

const { models: m } = AL;
export type _interface = i['gametip']

const l = (l : keyof typeof m) =>
    (opts : Partial<_interface>, limit : number = 1) => {
        return m[l].gametip.find(opts).limit(limit) 
    }

export const c = {
    'en-US': l('en-US'),
    'zh-CN': l('zh-CN')
}