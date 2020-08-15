import {
    CardType as Card,
    AttributeModifier as attrMod,
    GenderModifier as genMod,
    ClassModifier as claMod
} from '@pepper/constants/fgo';
import { Trait } from '@pepper/constants/fgo/strings';
import type { mstSvt } from '@pepper/db/fgo/master/mstSvt';
import type { mstClass } from '@pepper/db/fgo/master/mstClass';
import type { mstSvtLimit } from '@pepper/db/fgo/master/mstSvtLimit';
import type { mstSvtCard } from '@pepper/db/fgo/master/mstSvtCard';
import type { mstTreasureDeviceLv } from '@pepper/db/fgo/master/mstTreasureDeviceLv';
import type { mstTreasureDevice } from '@pepper/db/fgo/master/mstTreasureDevice';
import type { mstSkill } from '@pepper/db/fgo/master/mstSkill';
import type { mstFunc } from '@pepper/db/fgo/master/mstFunc';
import { MessageEmbed } from 'discord.js';
import { renderInvocation } from './func';
import { JP as NA } from '@pepper/db/fgo';
import { zipMap, componentLog } from '@pepper/utils';
import { parseVals_enhanced } from './datavals';
import { renderBuffStatistics } from './buffView';
import type { PromiseValue } from 'type-fest';

type tr = keyof typeof Trait;

export function embedServantBase(
    { name, baseSvtId, collectionNo } : mstSvt,
    { name: className } : mstClass,
    limits : mstSvtLimit[]
) {
    return new MessageEmbed()
        .setAuthor(`${
            [...new Set(limits.map(a => a.rarity))].sort((a, b) => a - b).join('-')
        }☆ ${className}`)
        .setTitle(`${collectionNo}. **${name}** (\`${baseSvtId}\`)`)
        .setURL(`https://apps.atlasacademy.io/db/#/JP/servant/${collectionNo}`)
        .setThumbnail(`https://assets.atlasacademy.io/GameData/JP/Faces/f_${baseSvtId}0.png`)
}

export async function embedServantDashboard(
    svt: mstSvt, limits: mstSvtLimit[], cards: mstSvtCard[], 
    { tdPoint, tdPointDef }: mstTreasureDeviceLv, allTrait = false
) {
    let { hpBase, hpMax, atkBase, atkMax } = limits[0],
        { cardIds, starRate, relateQuestIds, individuality, baseSvtId,
            attri, genderType, classId } = svt,
        ccount = (_ : Card) => cardIds.reduce((b, a) => a === _ ? b + 1 : b, 0),
        dmg = cards.sort((a, b) => a.cardId - b.cardId)
                .map(a => a.normalDamage);
    let ind = new Set(individuality);
        ind.delete(baseSvtId);
        ind.delete(attri + attrMod);
        ind.delete(genderType + genMod);
        ind.delete(claMod + classId);
    let inline = true;
    let out = [{
        name: 'HP/ATK',
        value: `- Base : ${hpBase}/${atkBase}\n- Maximum : ${hpMax}/${atkMax}`,
        inline
    }, {
        name: 'Cards / Damage distribution by %',
        value: `- Buster : ${ccount(Card.BUSTER)} / ${dmg[Card.BUSTER - 1].join('-')}`
            + `\n- Arts : ${ccount(Card.ARTS)} / ${dmg[Card.ARTS - 1].join('-')}`
            + `\n- Quick : ${ccount(Card.QUICK)} / ${dmg[Card.QUICK - 1].join('-')}`
            + `\n- Extra : 1 / ${dmg[Card.EXTRA - 1].join('-')}`,
        inline
    }, {
        name: 'NP generation',
        value: `Per hit : **${(tdPoint / 100).toFixed(2)}**%`
            + `\nWhen attacked : **${(tdPointDef / 100).toFixed(2)}**%`,
        inline
    }, {
        name: `Critical stars`,
        value: `Weight : **${limits[0].criticalWeight}**`
            + `\nGeneration : **${(starRate / 10).toFixed(1)}**%`,
        inline
    }, {
        name: 'Traits',
        value: [...ind]
            .map(a => Trait[a as tr] || a)
            // filter out not defined mappings
            .filter(a => allTrait ? 1 : isNaN(+a))
            .map(a => `* **${a}**`)
            .join('\n'),
        inline
    }, {
        name: 'Gender / Attribute', 
        value: `${Trait[(genderType + genMod) as tr]} / ${Trait[(attri + attrMod) as tr]}`,
        inline
    }];
    if (relateQuestIds.length) 
        out.push({
            name: `Related quests`,
            value: (await Promise.all(
                relateQuestIds
                    .map(id => NA.mstQuest.findOne({ id }).select('id name').exec())
            ))
                .map(q => `\`${q.id}\` ${q.name}`)
                .join('\n'),
            inline
        })
    
    return out;
}

export async function embedTreasureDeviceBase(td : mstTreasureDevice) {
    let { id } = td;
    let levels = await NA.mstTreasureDeviceLv.find({ treaureDeviceId: id }).exec();

    let base = levels[0];
    let funcBase = await Promise.all(
        base.funcId.map(
            id => NA.mstFunc.findOne({ id }).exec()
                .then(f => renderInvocation(f))
        )
    );
    return funcBase.map(_ => ({
        name: `${_.action} ${_.targets.map(a => `[${a.trim()}]`).join(', ')}`,
        value:
            `[Link](https://apps.atlasacademy.io/db/#/JP/func/${_.id})`
            + `\nAffects **${
                _.affectTarget
                + (_.traitVals.length
                    ? ` with ${_.traitVals.map(_ => `[${_}]`).join(', ')}`
                    : ``)
            }**`
            + (_.onTeam ? ` when on **${_.onTeam}** team` : '')
    }))
}

async function renderSkill(s: mstSkill) {
    let levels = await NA.mstSkillLv.find({ skillId: s.id }).exec();
    // precompiling stuff
    let cache = new Map<number, mstFunc>(),
        func = [...new Set(levels.map(l => l.funcId).flat())];
    await Promise.all(
        func.map(async f => cache.set(
            f,
            await NA.mstFunc.findOne({ id: f }).exec()
        ))
    )
    let _inv = func.map(async fid => {
        let vals = levels.map(
            level => level.svals[level.funcId.findIndex(_ => _ === fid)]
        );
        let resolvedVals = await Promise.all(
            vals.map(v => parseVals_enhanced(v, cache.get(fid).funcType))
        );
        // zip them up
        return {
            funcId: fid,
            vals: zipMap(resolvedVals)
        }
    })

    let invocations = await Promise.all(_inv);
    let _ = await Promise.all(invocations.map(
        async inv => ({
            func: await renderInvocation(cache.get(inv.funcId)),
            vals: inv.vals
        })
    ))
    return _;
}

export async function renderPassiveSkill(skillId: number, log = new componentLog(`Passive skill renderer`)) {
    let skill = await NA.mstSkill.findOne({ id: skillId }).exec();
    let acts = await renderSkill(skill);

    let funcs = new Map<number, typeof acts[0]['func']>();
    acts.forEach(_ => funcs.set(_.func.id, _.func));

    let values = acts.map(async _ => {
        let { func: f, vals } = _;

        // dedupe the values
        vals.forEach((v, k) => vals.set(k, [...new Set(v)]));

        let details : PromiseValue<ReturnType<typeof renderBuffStatistics>> = [];
        if (f.rawBuffs.length)
            details = await renderBuffStatistics(f.rawBuffs[0], vals)
            .catch(e => {
                log.error(`Rendering buff stats of function ${f.id} failed!`);
                throw e;
            })
        return (
            `**[${f.action} ${f.targets.map(a => `[${a.trim()}]`).join(', ')}]`
            + `(https://apps.atlasacademy.io/db/#/JP/func/${f.id})**`
            + ` on **${f.affectTarget}**${
                (f.onTeam ? `\nMember of : **${f.onTeam}** team` : '')
            }`
            + `${
                (`\n` + details.map(_ => `${_.name} : ${
                    // _.value.join(' / ')
                    _.value[0]
                    // a passive skill only has one degree of power?
                }`).join('\n')).trimRight()
            }`
        )
    })

    return {
        name: skill.name,
        value: (await Promise.all(values)).join('\n\n') 
    };
}