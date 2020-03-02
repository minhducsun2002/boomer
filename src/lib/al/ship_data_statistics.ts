import { interfaces as i } from '../../db/al'
import { AL } from '../../db/';
import escape from "escape-string-regexp";

const a: Function = (s: String): String => escape(s.toString()).replace(/\s/i, " ")

const { models: m } = AL;

type im = i['ship_data_statistics']
export type __im_template = i['ship_data_template'];
interface _ {
    id: __im_template['id'][],
    name: __im_template['name'],
    group_type: __im_template['group_type'],
    star: __im_template['star'][],
    type: __im_template['type'],
    english_name: im['english_name'][]
}
export type _interface = _

const l = (l : keyof typeof m) =>
    (opts : Partial<im>, limit : number = 1) => {
        let { name, english_name: en } = opts;
        if (name) (opts as any).name = { $regex: name ? a(name) : "", $options: "i" };
        if (en) (opts as any).english_name = { $regex: en ? a(en) : "", $options: "i" }
        return m[l].ship_data_statistics.find(opts).limit(limit) 
    }

const ll = (l : keyof typeof m) =>
    (opts : Partial<im>, limit : number = 1) => {
        let { name, english_name: en } = opts;
        if (name) (opts as any).name = { $regex: name ? a(name) : "", $options: "i" };
        if (en) (opts as any).english_name = { $regex: en ? a(en) : "", $options: "i" };

        return m[l].ship_data_statistics.aggregate([
            { $match: opts },
            { $lookup: { from: "ship_data_template", localField: "id", foreignField: "id", as: "t" } },
            { $unwind: "$t" },
            { 
                $group: { 
                    _id: "$t.group_type",
                    name: { $min: "$t.name" },
                    id: { $push: "$id" },
                    star: { $push: "$star" },
                    type: { $last: "$type" },
                    english_name: { $push: "$english_name" }
                } 
            },
            { $replaceRoot: { newRoot: { $mergeObjects: [{ group_type: "$_id" }, "$$ROOT"] } } }
        ])
    }

export const c = {
    'en-US': l('en-US'),
    'zh-CN': l('zh-CN')
}

export const cc = {
    'en-US': ll('en-US'),
    'zh-CN': ll('zh-CN')
}