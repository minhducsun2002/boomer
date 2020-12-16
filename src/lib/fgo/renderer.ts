import {
    CardType as Card,
    GenderModifier as genMod,
    ClassModifier as claMod,
    CardModifier as cardMod,
    Attribute,
    ApplyTarget,
    FuncType
} from '@pepper/constants/fgo';
import { ApplyTarget as aTgt, Trait } from '@pepper/constants/fgo/strings';
import type { mstSvt } from '@pepper/db/fgo/master/mstSvt';
import type { mstSvtLimit } from '@pepper/db/fgo/master/mstSvtLimit';
import type { mstSvtCard } from '@pepper/db/fgo/master/mstSvtCard';
import type { mstTreasureDeviceLv } from '@pepper/db/fgo/master/mstTreasureDeviceLv';
import type { mstSkill } from '@pepper/db/fgo/master/mstSkill';
import type { mstFunc } from '@pepper/db/fgo/master/mstFunc';
import type { mstCombineLimit } from '@pepper/db/fgo/master/mstCombineLimit';
import type { mstCombineSkill } from '@pepper/db/fgo/master/mstCombineSkill';
import { MessageEmbed, EmbedField } from 'discord.js';
import { renderInvocation, renderFunctionStatistics } from './func';
import { deduplicate, zipMap, plural_wrap } from '@pepper/utils';
import { parseVals } from './datavals';
import { renderBuffStatistics } from './buff';
import type { PromiseValue, SetOptional, SetRequired } from 'type-fest';
import type { DBInstance } from '@pepper/db/fgo';
import { ComplementaryDataModel } from '@pepper/modules/fgo/complementary-data';
import { EmbedFieldData } from 'discord.js';

type tr = keyof typeof Trait;
type statistics = PromiseValue<ReturnType<typeof renderBuffStatistics>> | ReturnType<typeof renderFunctionStatistics>;
const attribs = Object.values(Attribute);

interface SkillRenderOptions {
    /** Show/hide the side (player/enemy/both) on which the function applies. */
    side: boolean;
    /** Show/hide the probability of a skill triggerring. */
    chance: boolean;
    /** Whether to separate skill functions with an empty line. */
    newline: boolean;
    /** Whether to show skill cooldown */
    cooldown: boolean;
}

export class EmbedRenderer {
    NA : DBInstance;
    JP : DBInstance;
    complementary : ComplementaryDataModel;

    constructor(NA : DBInstance, JP : DBInstance, _comp : ComplementaryDataModel) {
        this.NA = NA; this.JP = JP;
        this.complementary = _comp;
    }

    /**
     * Create a base embed for servant details
     * @param svt `svt` object
     * @param className Class name
     * @param rarity Servant rarity
     */
    servantBase = (svt : mstSvt, className : string, rarity : number) => {
        let { name, baseSvtId, collectionNo } = svt;
        return new MessageEmbed()
            .setAuthor(`${rarity}☆ ${className}`)
            .setTitle(`${collectionNo}. **${name}** (\`${baseSvtId}\`)`)
            .setURL(`https://apps.atlasacademy.io/db/#/JP/servant/${collectionNo}`)
            .setThumbnail(`https://assets.atlasacademy.io/GameData/JP/Faces/f_${baseSvtId}0.png`)
    }

    /**
     * Make an embed listing traits
     * @param svt `svt` object
     * @param inline Whether to make the field inline
     */
    traits = (svt: mstSvt, inline = false) : EmbedField => {
        let { individuality, baseSvtId, genderType, classId } = svt;
        let ind = new Set(individuality);
            ind.delete(baseSvtId);
            ind.delete(genderType + genMod);
            ind.delete(claMod + classId);
        for (let a of attribs) ind.delete(a);
        return {
            name: 'Traits',
            value: [...ind].map(a => `* **${Trait[a as tr] || a}**`).join('\n'),
            inline
        }
    }

    /**
     * Make a servant dashboard.
     * 
     * Includes :
     * - Base & maximum HP/ATK
     * - NP generation rate
     * - Critical stars weight/generation rate
     * - Gender/Attribute
     * - Damage distribution of facecards
     * @param svt `svt` object
     * @param limits `svtLimit` object
     * @param cards `svtCard` object
     * @param tdLv `treasureDeviceLv` object
     */
    servantDashboard = (
        svt: mstSvt, limits: mstSvtLimit[], cards: mstSvtCard[], 
        tdLv: mstTreasureDeviceLv
    ) => {
        let { hpBase, hpMax, atkBase, atkMax } = limits[0],
            { cardIds, starRate, genderType, individuality } = svt,
            { tdPoint, tdPointDef } = tdLv,
            ccount = (_ : Card) => cardIds.reduce((b, a) => a === _ ? b + 1 : b, 0),
            dmg = cards.sort((a, b) => a.cardId - b.cardId)
                    .map(a => a.normalDamage);
    
        let b = ccount(Card.BUSTER), a = ccount(Card.ARTS), q = ccount(Card.QUICK), e = 1,
            bc = dmg[Card.BUSTER - 1], ac = dmg[Card.ARTS - 1], qc = dmg[Card.QUICK - 1],
            ec = dmg[Card.EXTRA - 1];
        let inline = true;
        return [{
            name: 'HP/ATK',
            value: `- Base : ${hpBase}/${atkBase}\n- Maximum : ${hpMax}/${atkMax}`,
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
            name: 'Gender / Attribute', 
            value: `${Trait[(genderType + genMod) as tr]} / ${Trait[
                individuality.find(a => attribs.includes(a)) as tr
            ]}`,
            inline
        }, {
            name: 'Cards / Damage distribution by %',
            value: [
                '```',
                '   Card   | Hit counts',
                `${b}x Buster | ${bc.length} (${bc.join('-')})`,
                `${a}x Arts   | ${ac.length} (${ac.join('-')})`,
                `${q}x Quick  | ${qc.length} (${qc.join('-')})`,
                `${e}x Extra  | ${ec.length} (${ec.join('-')})`,
                '```'
            ]
        }];
    }

    // return value :
    // { func, vals }[]
    // with vals being a Map<string, string[]>, with string[] being values of levels
    _prepareSkill = async (s: mstSkill) => {
        let db = this.JP;
        let skillLevels = await db.mstSkillLv.find({ skillId: s.id }).exec();
        
        // make a cache for function queries
        let functionCache = new Map<number, mstFunc>(),
            // list all function IDs that ever appeared in any skill
            functionIds = [...new Set(skillLevels.map(l => l.funcId).flat())];
        // pre-fetch all functions
        for (let f of functionIds) 
            functionCache.set(f, await db.mstFunc.findOne({ id: f }).exec())
        
        let invocations = skillLevels[0].funcId
            .map(async (functionId, index) => {
                let vals = skillLevels
                    .sort((a, b) => a.lv - b.lv)
                    .map(level => level.svals[index]);

                let resolvedVals = await Promise.all(vals.map(v => parseVals(v, functionCache.get(functionId).funcType)));

                let func = await renderInvocation(functionCache.get(functionId), db);
                return { func, vals: zipMap(resolvedVals) };
            })
        return await Promise.all(invocations);
    }

    /**
     * Render skills
     * @param skillId skill ID to render
     * @param opt rendering options
     */
    renderSkill = async (skillId: number, opt : Partial<SkillRenderOptions & { level?: number }> = {}) => {
        let db = this.JP;
        let skill = await db.mstSkill.findOne({ id: skillId }).exec();
        let turns = (
            opt.cooldown 
            ? await db.mstSkillLv.find({ skillId }).select('chargeTurn').exec()
            .then(levels => new Set(levels.map(lv => lv.chargeTurn)))
            .then(set => [...set].sort((a, b) => b - a))
            : []
        );
        let invocations = await this._prepareSkill(skill);
    
        // function lookup table
        let funcs = new Map<number, typeof invocations[0]['func']>();
        for (let { func } of invocations) funcs.set(func.id, func);
    
        let values = invocations.map(async _ => {
            let { func: f, vals } = _;
    
            // dedupe the values
            vals.forEach((values, key) => vals.set(key, deduplicate(values)));
            let stat = f.rawBuffs.length
                ? await renderBuffStatistics(f.rawBuffs[0], vals, this)
                : renderFunctionStatistics(f.rawType, vals);
            

            return (
                ('level' in opt && Number.isSafeInteger(opt.level))
                    // serialize this function as if it belongs to a single/active skill.
                    ? this.serializeSingleSkillRepresentation(stat, f, <SetRequired<typeof opt, 'level'>>opt)
                    : this.serializeActiveSkillRepresentation(stat, f, opt)
            ) 
        })

        // try to get skill name in NA
        let NAskillName = await this.NA.mstSkill.findOne({ id: skillId }).select('name').exec().then(s => s?.name);

        return {
            name: (NAskillName ?? skill.name) + (turns.length ? ` (${turns.join('-')})` : ''),
            value: (await Promise.all(values)).filter(Boolean).join(opt.newline ? '\n\n' : '\n') 
        };
    }

    private serializeActiveSkillRepresentation(
        stat : statistics,
        f : PromiseValue<ReturnType<typeof renderInvocation>>,
        opt : Partial<SkillRenderOptions> = {}) {
        let { side, chance: showChance } = opt;
        let targets = f.targets.map(a => `**[${a.trim()}]**`).join(', ');
        let team = side ? (f.onTeam ? `[${f.onTeam.substr(0, 1).toUpperCase() + f.onTeam.slice(1)}] ` : '') : '';
        
        // Active skills are only possessed by servants.
        // We usually don't care how a servant acts on the enemy side, I guess.
        if (f.onTeam === aTgt[ApplyTarget.ENEMY]) return '';
        // By default, everything is 100%.
        // We omit if that's the case to reduce clutter.
        if (stat.chance?.length === 1 && stat.chance[0] === '100%') showChance = false;
        // We also don't care about NOPs.
        // I mean, they have no effect, in most aspects I can think of.
        if (f.rawType === FuncType.NONE) return '';
        
        let amount = stat.amount?.length 
            ? (stat.amount?.length > 3 ? '\n ' : ' ') + 'of '
                + stat.amount.map(a => `**${a}**`).join(' / ')
                + (stat.amount?.length > 3 ? '\n' : '')
            : '';
        let chance = stat.chance?.length
            ? stat.chance.map(a => `**${a}**`).join(' / ') 
                + ' chance to'
                + (stat.chance?.length > 3 ? '\n' : ' ')
            : '';
        let limits = [
            stat?.count ? [stat.count, stat.count.length === 1 ? plural_wrap(+stat.count[0], 'time') : 'times'] : '',
            stat?.turn ? [stat.turn, stat.turn.length === 1 ? plural_wrap(+stat.turn[0], 'turn') : 'turns'] : '',
        ]
            .filter(Boolean)
            .map(([count, type]) => `**${count}** ${type}`).join(', ');
        
        f.action = (showChance ? f.action.substr(0, 1).toLowerCase() + f.action.substr(1) : f.action);
        let functionAction = `${targets ? f.action : '**' + f.action + '**'}${targets ? ' ' + targets : ''}`;
        return (
            team
            + (showChance ? chance : '')
            + functionAction
            + ` to ${f.affectTarget}`
            + (f.traitToAffect?.length ? ` with ${f.traitToAffect.map(a => `[${a}]`).join(', ')}` : '')
            + (limits ? ` (${limits})` : '')
            + (f.traitVals?.length ? ` for ${f.traitVals.join(' & ')} targets` : '')
            + amount
            + (stat.onField?.length ? ' when the wearer is on field' : '')
            + (f.fieldTraits.length ? ` if on ${f.fieldTraits.map(a => `__[${a}]__`).join(' & ')} field` : '')
            + (`\n` + (stat?.other?.map(_ => `${_.name} : ${_?.serializeValue?.() ?? _.value}`).join('\n') || '')).trimRight()
        ).trimRight();
    }


    private serializeSingleSkillRepresentation(
        stat : statistics,
        f : PromiseValue<ReturnType<typeof renderInvocation>>,
        opt : SetRequired<Partial<SkillRenderOptions & { level: number }>, 'level'> = { side: true, chance: true, level: 0 }
    ) {
        let { side, chance, level } = opt;
        let targets = f.targets.map(a => `[${a.trim()}]`).join(', ');
        let team = side ? (f.onTeam ? `[${f.onTeam.substr(0, 1).toUpperCase() + f.onTeam.slice(1)}] ` : '') : '';
        let _chance = stat?.chance?.[level] || stat?.chance?.[0];
            // chance might be zipped
            _chance = (_chance ? `**${_chance}** chance to\n` : '');
        let functionAction = `**${f.action}${targets ? ' ' + targets : ''}**`;
        let limits = [
            stat?.count ? [stat.count, stat.count.length === 1 ? plural_wrap(+stat.count[0], 'time') : 'times'] : '',
            stat?.turn ? [stat.turn, stat.turn.length === 1 ? plural_wrap(+stat.turn[0], 'turn') : 'turns'] : '',
        ]
            .filter(Boolean)
            .map(([count, type]) => `**${count}** ${type}`).join(', ');
        return (
            team
            + (chance ? _chance : '')
            + functionAction
            + (f.traitToAffect?.length ? ` with ${f.traitToAffect.map(a => `[${a}]`).join(', ')}` : '')
            + (stat?.amount?.length ? ` of **${stat.amount[level]}**` : '')
            + (limits ? ` (${limits})` : '')
            + ` to **${f.affectTarget}**`
            + (f.traitVals?.length ? ` for ${f.traitVals.join(' & ')} targets` : '')
            + (stat.onField?.length ? ' when the wearer is on field' : '')
            + (f.fieldTraits.length ? ` if on ${f.fieldTraits.map(a => `__[${a}]__`).join(' & ')} field` : '')
            + (`\n` + (stat?.other?.map(_ => `${_.name} : ${_.value[level]}`).join('\n') || '')).trimRight()
        )
    }

    private async renderTreasureDevice (treasureDeviceId : number) {
        let db = this.JP;
        let treasureDevice = await db.mstTreasureDevice.findOne({ id: treasureDeviceId }).exec();
        let levels = await db.mstTreasureDeviceLv.find({ treaureDeviceId: treasureDevice.id }).sort({ lv: 1 }).exec();
        let invocations = levels[0].funcId.map(async (funcId, entryIndex) => {
            // the assumption here is that a value would never differ in both overcharge and level
            // a value should only change when EITHER overcharge OR level changes

            let outputValue = new Map<string, string[]>();
            let overchargeKey : string[] = [], levelKey : string[] = [], staticKey : string[] = [];

            let _function = await db.mstFunc.findOne({ id: funcId }).exec();

            {
                let level = levels[0];
                let svals = [level.svals, level.svals2, level.svals3, level.svals4, level.svals5];
                let _level = levels.map(level => parseVals(level.svals[entryIndex], _function.funcType));
                
                [
                    // check for level changes at overcharge 1
                    [overchargeKey, svals.map(overcharge => parseVals(overcharge[entryIndex], _function.funcType))],
                    // check for overcharge changes at level 1
                    [levelKey, _level]
                ]
                .forEach(([keySetToPush, values]) => {
                    let vals = zipMap(values as Exclude<typeof values, string[]>);
                    for (let [key, value] of vals) 
                        if (deduplicate(value).length !== 1) {
                            (<string[]>keySetToPush).push(key);
                            outputValue.set(key, deduplicate(value));
                        }
                })

                for (let [key, value] of zipMap(_level))
                    // collect the rest of the key 
                    if (!overchargeKey.includes(key) && !levelKey.includes(key)) {
                        staticKey.push(key);
                        outputValue.set(key, deduplicate(value));
                    }
            }
            
            
            let func = await renderInvocation(_function, db);
            let stat = func.rawBuffs.length
                ? await renderBuffStatistics(func.rawBuffs[0], outputValue, this)
                : renderFunctionStatistics(func.rawType, outputValue);

            return {
                overcharge: overchargeKey,
                level: levelKey,
                static: staticKey,
                stat,
                func,
            }
        });
        let oc : string[] = [], level : string[] = [], both: string[] = [], none: string[] = [];
        for (let { stat, func, level: _level, overcharge } of await Promise.all(invocations)) {
            let serializedText = this.serializeActiveSkillRepresentation(
                stat, func,
                { chance: true, side: false, newline: true, cooldown: true }
            )
            if (serializedText)
            if (_level.length && overcharge.length) both.push(serializedText);
                else (overcharge.length ? oc : (_level.length ? level : none)).push(serializedText)
        }
        
        let fields : SetOptional<EmbedFieldData, 'inline'>[] = [];
        fields.push({ name: '\u200b', value: none.concat(level).join('\n') });
        fields.push({ name: '[Overcharge]', value: oc.join('\n') });
        fields.push({ name: '[Overcharge] & [Level]', value: both.join('\n') });

        // English name/ranks
        let NA = await this.NA.mstTreasureDevice.findOne({ id: treasureDeviceId }).exec()
        treasureDevice.name = NA?.name ?? treasureDevice.name;
        treasureDevice.rank = NA?.rank ?? treasureDevice.rank;
        treasureDevice.typeText = NA?.typeText ?? treasureDevice.typeText;

        return { raw: treasureDevice, fields: fields.filter(field => field.value.trimRight()) };
    }

    renderItems = (combineLimits : mstCombineLimit[] | mstCombineSkill[], type : 'ascension' | 'skill') => {
        let limits : typeof combineLimits, words : Promise<SetOptional<EmbedField, 'inline'>>[];
        let name = '', shift = 0;
        switch (type) {
            case 'ascension':
                limits = (<mstCombineLimit[]>combineLimits).sort((a, b) => a.svtLimit - b.svtLimit).slice(0, 4);
                name = 'Stage';
                shift = 1;
                break;
            case 'skill':
                limits = (<mstCombineSkill[]>combineLimits).sort((a, b) => a.skillLv - b.skillLv);
                name = 'Level';
                shift = 2;
        }
        words = (limits as (mstCombineLimit|mstCombineSkill)[]).map(async (limit, i) => {
            let { itemIds, itemNums, qp } = limit;
            let items = itemIds
                .map(async id => await this.complementary.item.findOne({ id }).exec())
                .map((itemRecord, i) => itemRecord.then(item => `- **${itemNums[i]}**x **${item?.name}**`));
            let itemRecord = (await Promise.all(items)).join('\n');
            let numberFormatter = new Intl.NumberFormat('en-US', {style: 'decimal'});
            return {
                name: `${name} ${i + shift} - ${numberFormatter.format(qp)} QP`,
                value : `${itemRecord}\n`
            }
        })
        return Promise.all(words);
    } 

    servantDashboardEmbed = async (name : string, id : number) : Promise<MessageEmbed[]> => {
        let { NA, JP } = this;
    
        const svt = await JP.mstSvt.findOne({ collectionNo: +id }).exec();
        let { baseSvtId, classId, classPassive } = svt;
        const [limits, cards, __class] = await Promise.all([
            await JP.mstSvtLimit.find({ svtId: baseSvtId }).limit(5).exec(),
            await JP.mstSvtCard.find({ svtId: baseSvtId }).limit(4).exec(),
            await NA.mstClass.findOne({ id: classId }).exec()
        ]);
        // render NP gain
        const svtTdMapping = await JP.mstSvtTreasureDevice.find({ svtId: baseSvtId, num: 1 }).exec();
        let [{ treasureDeviceId: tdId }] = svtTdMapping;
        const td_npGain = await JP.mstTreasureDeviceLv.findOne({ treaureDeviceId: tdId }).exec();
    
        // overwrite name
        svt.name = name;
        let base = () => this.servantBase(svt, __class.name, Math.max(...limits.map(_ => _.rarity)));

        let passives = await Promise.all(classPassive.map(_ => this.renderSkill(_, { level: 0, side: true, newline: true })));
        let ascItems = await this.renderItems(await this.JP.mstCombineLimit.find({ id: baseSvtId }).limit(5).exec(), 'ascension');
        let skillItems = await this.renderItems(await this.JP.mstCombineSkill.find({ id: baseSvtId }).limit(9).exec(), 'skill');
        return [
            base()
                .addFields(this.servantDashboard(svt, limits, cards, td_npGain))
                .setFooter(`Basic details`),
            base()
                .addFields([this.traits(svt)]).setFooter('Traits'),
            base().addFields(passives).setFooter(`Passive skills`),
            // cover case where no ascension material
            (ascItems.length
            ? base().addFields(ascItems).setFooter(`Ascension materials`)
            : base().setDescription(`No materials needed.`).setFooter(`Ascension materials`)),
            base()
                .addFields(skillItems).setFooter(`Skill materials`)
        ]
        .map((a, i, _) => a.setFooter(`${
            a.footer?.text ? `${a.footer.text} • ` : ''
        }Page ${++i}/${_.length}`));
    }

    skillEmbed = async (collectionNo : number) => {
        let svt = await this.JP.mstSvt.findOne({ collectionNo }).exec();
        svt.name = (await this.complementary.svtObject.findOne({ id: svt.id }).exec())?.name ?? svt.name;
        let records = await this.JP.mstSvtSkill.find({ svtId: svt.id }).exec();

        // sort into positions
        let numMap = new Map<number, (typeof records[0])[]>();
        for (let rec of records)
            if (numMap.has(rec.num)) numMap.get(rec.num).push(rec);
            else numMap.set(rec.num, [rec]);
        let skills = [...numMap]
            .sort((a, b) => a[0] - b[0])
            .map(rec => rec[1].sort((a, b) => a.priority - b.priority));

        let output : SetOptional<EmbedFieldData, 'inline'>[][] = [];
        for (let position of skills) {
            let out : typeof output[0] = [];
            for (let record of position) {
                out.push(
                    await this.renderSkill(record.skillId, { chance: true, side: false, newline: true, cooldown: true })
                )
            }
            output.push([...out, { name: '\u200b', value: '\u200b' }]);
        }
        let skillText = output.flat(); skillText.pop();

        const [limits, __class] = await Promise.all([
            await this.JP.mstSvtLimit.find({ svtId: svt.id }).limit(5).exec(),
            await this.NA.mstClass.findOne({ id: svt.classId }).exec()
        ]);
        return this.servantBase(svt, __class.name, Math.max(...limits.map(_ => _.rarity)))
            // remove thumbnail for a bit of space
            .setThumbnail(null)
            .addFields(skillText)
    }

    craftEssenceEmbed = async (id : number) => {
        let mstSvt = await this.JP.mstSvt.findOne({ id }).exec();
        let { name, cost, collectionNo } = mstSvt;
        let englishName = await this.complementary.svtObject.findOne({ id }).exec();
        // get all skills
        let skillRecords = await this.JP.mstSvtSkill.find({ svtId: id }).exec();
        // determining MLB skills
        let condLimitCounts = skillRecords.map(a => a.condLimitCount);
        let limitBase = Math.min(...condLimitCounts),
            limitMax  = Math.max(...condLimitCounts);
        // sort for MLB
        let baseSkills = skillRecords.filter(a => a.condLimitCount === limitBase),
            maxSkills  = skillRecords.filter(a => (a.condLimitCount === limitMax) && (a.condLimitCount !== limitBase));
        
        let [baseEffects, maxEffects] = [baseSkills, maxSkills]
            .map(async (skills, idx) => {
                let isBaseEffects = idx === 0;
                let skillIds = skills.map(a => a.skillId);

                // sort skillIds for deterministicness
                skillIds = skillIds.sort((a, b)=> a - b)
                let results = await Promise.all(
                    skillIds.map(id => this.renderSkill(id, { level: 0 }))
                )
                // merge 
                return {
                    name: isBaseEffects ? 'Base' : 'Maximum limit break',
                    value: results.map(a => a.value).join('\n')
                };
            })
        let [base, max] = [await baseEffects, await maxEffects];
        return new MessageEmbed()
            .setURL(`https://apps.atlasacademy.io/db/#/JP/craft-essence/${id}`)
            .setTitle(`${collectionNo}. ${englishName?.name || name} (\`${id}\`)`)
            .setDescription(`Cost : ${cost}`)
            .addFields([base, max].filter(a => a.value));
    }

    treasureDeviceEmbed = async (collectionNo : number) => {
        let db = this.JP;

        let svt = await db.mstSvt.findOne({ collectionNo }).exec();
        let treasureDevices = await db.mstSvtTreasureDevice.find({ svtId: svt.baseSvtId }).exec()
            .then(records => records.filter(rec => rec.priority))
            .then(records => records.sort((a, b) => a.treasureDeviceId - b.treasureDeviceId));

        svt.name = await this.complementary.svtObject.findOne({ id: svt.baseSvtId }).exec().then(obj => obj?.name ?? svt.name);
        let data = await Promise.all(treasureDevices.map(td => this.renderTreasureDevice(td.treasureDeviceId)));

        let generator = (_data : typeof data[0], index : number) => {
            let { damage, cardId } = treasureDevices[index];
            let { raw, fields } = _data;
            return new MessageEmbed()
                .setURL(`https://apps.atlasacademy.io/db/#/JP/noble-phantasm/${raw.id}`)
                .setAuthor(`${svt.collectionNo}. ${svt.name}`)
                .setTitle(`[${raw.typeText}] ${raw.name} [__${raw.rank}__]`)
                .setDescription(
                    `Card : **${Trait[cardId + cardMod as tr]}** – Hit count : **${damage.length}** (${damage.join('-')})`,
                )
                .addFields(fields)
                .setThumbnail(null);
        }


        return data.map(generator);
    }
}