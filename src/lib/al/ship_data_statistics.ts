import { interfaces as i } from '../../db/al'
import { AL } from '../../db/';
import escape from "escape-string-regexp";

const a: Function = (s: String): String => escape(s.toString()).replace(/\s/i, " ")

const { models: m } = AL;

type im = i['ship_data_statistics']

const l = (l : keyof typeof m) =>
    (opts : Partial<im>, limit : number = 1) => {
        // customized logic
        let { name, english_name: en } = opts;
        if (name) (opts as any).name = { $regex: name ? a(name) : "", $options: "i" };
        if (en) (opts as any).english_name = { $regex: en ? a(en) : "", $options: "i" }

        return m[l].ship_data_statistics.aggregate([
            // grouping same-name records to single ships
            { $group: { _id: "$name", orig: { $mergeObjects: "$$ROOT" } } },
            // filtering for skin_id only
            // no need to specify _id, included by default
            { $project: { "orig.skin_id": 1, "orig.star": 1, "orig.id": 1, "orig.english_name": 1 } },
            // move `_id` to `name`, 
            {
                $replaceRoot: {
                    newRoot: {
                        $mergeObjects: [
                            { name: "$_id" },
                            { skin_id: "$orig.skin_id", star: "$orig.star", id: "$orig.id", english_name: "$orig.english_name" },
                        ] 
                    }
                }
            },
            // normal query
            { $match: opts }
        ]).limit(limit)
    }

export const c = {
    'en-US': l('en-US'),
    'zh-CN': l('zh-CN')
}