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
import { MessageEmbed } from 'discord.js';
import { renderInvocation } from './func';
import { NA } from '@pepper/db/fgo';

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
}

export function embedServantDashboard(
    svt: mstSvt, cl : mstClass, limits: mstSvtLimit[], cards: mstSvtCard[], 
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
    return embedServantBase(svt, cl, limits)
        .addField(
            'HP/ATK',
            `- Base : ${hpBase}/${atkBase}\n- Maximum : ${hpMax}/${atkMax}`,
            true
        )
        .addField(
            'Cards / Damage distribution by %',
            // -1 due to array from 0
            `- Buster : ${ccount(Card.BUSTER)} / ${dmg[Card.BUSTER - 1].join('-')}`
            + `\n- Arts : ${ccount(Card.ARTS)} / ${dmg[Card.ARTS - 1].join('-')}`
            + `\n- Quick : ${ccount(Card.QUICK)} / ${dmg[Card.QUICK - 1].join('-')}`
            + `\n- Extra : 1 / ${dmg[Card.EXTRA - 1].join('-')}`,
            true
        )
        .addField(
            'NP generation',
            `Per hit : **${
                (tdPoint / 100).toFixed(2)
            }**%\nWhen attacked : **${
                (tdPointDef / 100).toFixed(2)
            }**%`,
            true
        )
        .addField(
            `Critical stars`,
            `Weight : **${limits[0].criticalWeight}**\nGeneration : **${
                (starRate / 10).toFixed(1)
            }**%`,
            true
        )
        .addField(
            'Traits',
            [...ind]
                .map(a => Trait[a as keyof typeof Trait] || a)
                // filter out not defined mappings
                .filter(a => allTrait ? 1 : isNaN(+a))
                .map(a => `* **${a}**`)
                .join('\n'),
            true
        )
        .addField(
            'Gender / Attribute', 
            `${Trait[
                (genderType + genMod) as keyof typeof Trait
            ]} / ${Trait[
                (attri + attrMod) as keyof typeof Trait
            ]}`,
            true
        ).addField(
            'Related quests (ID)',
            relateQuestIds.map(a => `\`${a}\``).join(', ') || 'None',
            true
        )
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
        name: `${_.action} ${_.targets.map(a => `[${a}]`).join(', ')}`,
        value: `Apply when on ${_.affectWhenOnTeam} team`
            + `\nAffects ${_.affectTarget}`
    }))
}