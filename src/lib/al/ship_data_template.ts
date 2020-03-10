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
    type: im['type'],
    english_name: i['ship_data_statistics']['english_name'][]
}
export type _interface = _

// special query
const ll = (l : keyof typeof m) =>
    (opts : Partial<im>, limit : number = 1) => {
        let { name } = opts;
        if (name) {
            delete opts.name;
            (opts as any) = {
                $and: [
                    {
                        $or: [{
                            name: { $regex: a(name), $options: "i" },
                        }, {
                            english_name: { $regex: a(name), $options: "i" }
                        }]
                    },
                    opts
                ]
            }
        }

        let __ = m[l].ship_data_template.aggregate([
            // get record from ship_data_statistics for english name
            { $lookup: { from: "ship_data_statistics", localField: "id", foreignField: "id", as: "stats" } },
            { $unwind: "$stats" },
            // group by group ID
            // pushing ship IDs with stars too
            // we don't need map (ID -> star) for now
            {
                $group: {
                    _id: "$group_type",
                    name: { $min: "$name" },
                    id: { $push: "$id" },
                    star: { $push: "$star" },
                    type: { $last: "$type" },
                    english_name: { $push: "$stats.english_name" }
                } 
            },
            { $match: opts },
            // standardizing as schema defined
            { $replaceRoot: { newRoot: { $mergeObjects: [{ group_type: "$_id" }, "$$ROOT"] } } },
            // remove _id
            { $project: { _id: 0 } },
            // sort star & id for ease
            { $sort: { star: 1 } }, 
            { $sort: { id: 1 } },
        ]).limit(limit)
        return (__ as any).cache() as typeof __

    }

const l = (l : keyof typeof m) =>
    (opts : Partial<im>, limit : number = 1) => {
        let { name } = opts;
        if (name) (opts as any).name = { $regex: name ? a(name) : "", $options: "i" };

        let _ = m[l].ship_data_template.find(opts).limit(limit);
        return (_ as any).cache() as typeof _;
    }

export const cc = {
    'en-US': ll('en-US'),
    'zh-CN': ll('zh-CN')
}

export const c = {
    'en-US': l('en-US'),
    'zh-CN': l('zh-CN')
}