import { interfaces as i } from '../../db/al'
import { AL } from '../../db/';
import escape from "escape-string-regexp";

const a: Function = (s: String): String => escape(s.toString()).replace(/\s/i, " ")

const { models: m } = AL;

export type _interface = i['ship_data_statistics']

const l = (l : keyof typeof m) =>
    (opts : Partial<_interface>, limit : number = 1) => {
        let { name, english_name: en } = opts;
        if (name) (opts as any).name = { $regex: name ? a(name) : "", $options: "i" };
        if (en) (opts as any).english_name = { $regex: en ? a(en) : "", $options: "i" }
        return m[l].ship_data_statistics.find(opts).limit(limit) 
    }

const ll = (l : keyof typeof m) =>
    (opts : Partial<_interface>, limit : number = 1) => {
        let { name, english_name: en } = opts;
        if (name) (opts as any).name = { $regex: name ? a(name) : "", $options: "i" };
        if (en) (opts as any).english_name = { $regex: en ? a(en) : "", $options: "i" };

        // return m[l].ship_data_statistics.aggregate([
            
        // ])
        return m[l].ship_data_statistics.find(opts).limit(limit) 
    }

export const c = {
    'en-US': l('en-US'),
    'zh-CN': l('zh-CN')
}

export const cc = {
    'en-US': ll('en-US'),
    'zh-CN': ll('zh-CN')
}