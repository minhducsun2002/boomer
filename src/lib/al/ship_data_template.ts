import { interfaces as i } from '../../db/al'
import { AL } from '../../db/';
import escape from "escape-string-regexp";

const a: Function = (s: String): String => escape(s.toString()).replace(/\s/i, " ")

const { models: m } = AL;

type im = i['ship_data_template'];
interface _ {
    id: im['id'][],
    name: im['name'],
    group_type: im['group_type'],
    star: im['star'][],
    type: im['type']
}
export type _interface = _

const l = (l : keyof typeof m) =>
    (opts : Partial<im>, limit : number = 1) => {
        let { name } = opts;
        if (name) (opts as any).name = { $regex: name ? a(name) : "", $options: "i" };

        return m[l].ship_data_template.aggregate([
            // group by group ID
            // pushing ship IDs with stars too
            // we don't need map (ID -> star) for now
            {
                $group: {
                    _id: "$group_type",
                    name: { $last: "$name" },
                    id: { $push: "$id" },
                    star: { $push: "$star" },
                    type: { $last: "$type" }
                } 
            },
            // standardizing as schema defined
            { $replaceRoot: { newRoot: { $mergeObjects: [{ group_type: "$_id" }, "$$ROOT"] } } },
            // remove _id
            { $project: { _id: 0 } },
            // sort star & id for ease
            { $sort: { star: 1 } }, { $sort: { id: 1 } },
            // carry out the query on them
            { $match: opts }
        ]).limit(limit)

    }

export const c = {
    'en-US': l('en-US'),
    'zh-CN': l('zh-CN')
}