import { ServantModel } from '../../db/index'
import escape from "escape-string-regexp";

export interface SearchParameters {
    name?: String;
    // name, substring
    class?: String[];
    // servant class, ORed
    traits?: String[];
    // servant trait, ANDed
    looseTraits?: String[];
    // servant trait (substr match), ANDed
    gender?: String;
    attribute?: String;
    alignment?: String;
    skill?: String;
    id?: Number;
    np?: String;
}

/**
 * Sanitize strings.
 * @param s String to sanitize
 */
const a: Function = (s: String): String => escape(s.toString()).replace(/\s/i, " ");

export { a as sanitize };

/**
 * Construct database query. `id` overrides all other options.
 * @param parameters Search parameters
 * @param limit Search result limit
 */
export function constructQuery(parameters: SearchParameters, limit: number = 1) {
    let { id, name, class: _class, traits, looseTraits, gender, attribute: attrib, alignment: align, skill, np } = parameters;

    traits = traits ? traits : [];
    looseTraits = looseTraits ? looseTraits : [];
    _class = _class ? _class : []

    const nameQ = { $regex: name ? a(name) : "", $options: "i" }
    const traitQ = traits.map(s => ({ traits: { $elemMatch: { $regex: `^${a(s)}$`, $options: "i" } } }))
    const looseTraitQ = looseTraits.map(s => ({ traits: { $elemMatch: { $regex: `^${a(s)}$`, $options: "i" } } }))
    const classQ = _class.map(s => ({ class: { $regex: a(s), $options: "i" } }))
    const genderQ = { $regex: gender ? `^${a(gender)}$` : "", $options: "i" }
    const attributeQ = { $regex: attrib ? `^${a(attrib)}$` : "", $options: "i" }
    const alignmentQ = { $regex: align ? `^${a(align)}$` : "", $options: "i" }
    const npQ = { $regex: np ? a(np) : "", $options: "i" };
    const skillQ = { $regex: skill ? a(skill) : "", $options: "i" }

    const fallbackQuery = [
        (name ? 
            { 
                $or: [
                    { name: nameQ },
                    { alias: { $elemMatch: nameQ } }
                ] 
            } 
            : undefined), 
        np ? { noblePhantasm: { $elemMatch: { name: npQ } } } : undefined,
        skill ? { activeSkill: { $elemMatch: { $elemMatch: { name: skillQ } } } } : undefined
    ].filter(Boolean);

    // constructing query here
    const query = id ? { id } : {
        $and: [
            fallbackQuery.length ? { $or: fallbackQuery } : {},
            (traits.length ? { $and: traitQ } : {}),
            (looseTraits.length ? { $and: looseTraitQ } : {}),
            (_class.length ? { $or: classQ } : {}),
            (gender ? { gender: genderQ } : {}),
            (attrib ? { attribute: attributeQ } : {}),
            (align ? { alignment: alignmentQ } : {}),
        ]
    }

    return ServantModel.find(query).limit(limit);
}