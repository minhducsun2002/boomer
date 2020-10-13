import {
    CardType as Card,
    GenderModifier as genMod,
    ClassModifier as claMod,
    Attribute
} from '@pepper/constants/fgo';
import { Trait } from '@pepper/constants/fgo/strings';
import type { mstSvt } from '@pepper/db/fgo/master/mstSvt';
import type { mstSvtLimit } from '@pepper/db/fgo/master/mstSvtLimit';
import type { mstSvtCard } from '@pepper/db/fgo/master/mstSvtCard';
import type { mstTreasureDeviceLv } from '@pepper/db/fgo/master/mstTreasureDeviceLv';
import type { mstTreasureDevice } from '@pepper/db/fgo/master/mstTreasureDevice';
import type { mstSkill } from '@pepper/db/fgo/master/mstSkill';
import type { mstFunc } from '@pepper/db/fgo/master/mstFunc';
import type { mstCombineLimit } from '@pepper/db/fgo/master/mstCombineLimit';
import type { mstCombineSkill } from '@pepper/db/fgo/master/mstCombineSkill';
import { MessageEmbed, EmbedField } from 'discord.js';
import { renderInvocation, renderFunctionStatistics } from './func';
import { zipMap, componentLog } from '@pepper/utils';
import { parseVals_enhanced } from './datavals';
import { renderBuffStatistics } from './buff';
import type { PromiseValue } from 'type-fest';
import type { DBInstance } from '@pepper/db/fgo';
import type { Servant } from '@pepper/db/fgo/main';
import comp from '@pepper/modules/fgo/complementary-data';

type tr = keyof typeof Trait;
const attribs = Object.values(Attribute);

export class EmbedRenderer {
    NA : DBInstance;
    JP : DBInstance;
    complementary : comp;

    singleLevelSkillLogger = new componentLog(`Single-level skill renderer`)

    constructor(NA : DBInstance, JP : DBInstance, _comp : comp) {
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

    treasureDeviceBase = async  ({ id } : mstTreasureDevice) => {
        let db = this.JP;
        let level = await db.mstTreasureDeviceLv.findOne({ treaureDeviceId: id }).exec();
        let td = level.funcId.map(
            id => db.mstFunc.findOne({ id }).exec()
                .then(f => renderInvocation(f, db))
                .then(_ => ({
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
        );
        return await Promise.all(td);
    }

    // return value :
    // { func, vals }[]
    // with vals being a Map<string, string[]>, with string[] being values of levels
    private _prepareSkill = async (s: mstSkill) => {
        let db = this.JP;
        let skillLevels = await db.mstSkillLv.find({ skillId: s.id }).exec();
        
        // make a cache for function queries
        let functionCache = new Map<number, mstFunc>(),
            // list all function IDs that ever appeared in any skill
            functionIds = [...new Set(skillLevels.map(l => l.funcId).flat())];
        // pre-fetch all functions
        for (let f of functionIds) {
            functionCache.set(
                f,
                await db.mstFunc.findOne({ id: f }).exec()
            )
        }
        // for each function
        let _inv = functionIds.map(async fid => {
            // parse datavals for current function
            let vals = skillLevels.map(
                level => level.svals[level.funcId.findIndex(_ => _ === fid)]
            );

            let resolvedVals = await Promise.all(
                vals.map(v => parseVals_enhanced(v, functionCache.get(fid).funcType))
            );

            // stringify the current function into human-friendly format
            let func = await renderInvocation(functionCache.get(fid), db);
            return { func, vals: zipMap(resolvedVals) };
        })
    
        return await Promise.all(_inv);
    }

    /**
     * Render skills that has only one level (i.e. CE skills or passive skills),
     * or a level specified
     * @param skillId skill ID to render
     * @param opt.showTeam whether to include the side (player/enemy) that the skill applies
     * @param opt.showChance whether to show chance of skill trigger (CEs will not need this enabled)
     * @param opt.newline whether to include another newline to separate skill effects
     * @param opt.addLink whether to include link to function @ AA-DB
     * @param opt.level choose skill levels to parse, certain skills have 2 levels
     */
    renderSkill_asSingleLevel = async (skillId: number, opt = {
        showTeam: true, showChance: true, newline: true, addLink: true, level: 0
    }) => {
        let db = this.JP;
        let skill = await db.mstSkill.findOne({ id: skillId }).exec();
        let invocations = await this._prepareSkill(skill);
    
        // function lookup table
        let funcs = new Map<number, typeof invocations[0]['func']>();
        for (let { func } of invocations) funcs.set(func.id, func);
    
        let values = invocations.map(async _ => {
            let { func: f, vals } = _;
    
            // dedupe the values
            vals.forEach((v, k) => vals.set(k, [...new Set(v)]));
            let stat : PromiseValue<ReturnType<typeof renderBuffStatistics>> | ReturnType<typeof renderFunctionStatistics>;
            if (f.rawBuffs.length) {
                stat = await renderBuffStatistics(f.rawBuffs[0], vals, this)
                .catch(e => {
                    this.singleLevelSkillLogger
                        .error(`Rendering buff stats of function ${f.id}, skill ${skillId} failed!`);
                    throw e;
                });
            }
            else {
                stat = renderFunctionStatistics(f.rawType, vals);
            }

            let { showTeam, showChance, addLink, level } = opt;

            let targets = f.targets.map(a => `[${a.trim()}]`).join(', ');
            let team = showTeam ? (f.onTeam ? `[${f.onTeam.substr(0, 1).toUpperCase() + f.onTeam.slice(1)}] ` : '') : '';
            let chance = (stat?.chance ? `**${stat.chance[level]}** chance to\n` : '');
            let functionAction = `**${f.action}${targets ? ' ' + targets : ''}**`;
            return (
                team
                + (showChance ? chance : '')
                + (addLink ? `[${functionAction}]` : functionAction)
                + (addLink ? `(https://apps.atlasacademy.io/db/#/JP/func/${f.id})` : '')
                + (f.traitToAffect?.length ? ` with ${f.traitToAffect.map(a => `[${a}]`).join(', ')}` : '')
                + (stat?.amount ? ` of **${stat.amount[level]}**` : '')
                + ` on **${f.affectTarget}**`
                + (f.traitVals?.length ? ` for ${f.traitVals.join(' & ')} targets` : '')
                + (stat.onField?.length ? ' when the wearer is on field' : '')
                + (`\n` + (stat?.other?.map(_ => `${_.name} : ${_.value[level]}`).join('\n') || '')).trimRight()
            )
        })
    
        return {
            name: skill.name,
            value: (await Promise.all(values)).join(opt.newline ? '\n\n' : '\n') 
        };
    }

    renderAscensionItems = (combineLimits : mstCombineLimit[]) => {
        let limits = combineLimits.sort((a, b) => a.svtLimit - b.svtLimit).slice(0, 4);
        let words = limits.map(async (limit, i) => {
            let { itemIds, itemNums, qp } = limit;
            let items = itemIds
                .map(async id => await this.complementary.item.findOne({ id }).exec())
                .map((itemRecord, i) => itemRecord.then(item => `- **${itemNums[i]}**x **${item?.name}**`));
            let itemRecord = (await Promise.all(items)).join('\n');
            let numberFormatter = new Intl.NumberFormat('en-US', {style: 'decimal'});
            return {
                name: `Stage ${i + 1} - ${numberFormatter.format(qp)} QP`,
                value : `${itemRecord}\n`
            }
        })
        return Promise.all(words);
    }

    renderSkillItems = (combineLimits : mstCombineSkill[]) => {
        let limits = combineLimits.sort((a, b) => a.skillLv - b.skillLv)
        let words = limits.map(async (limit, i) => {
            let { itemIds, itemNums, qp } = limit;
            let items = itemIds
                .map(async id => await this.complementary.item.findOne({ id }).exec())
                .map((itemRecord, i) => itemRecord.then(item => `- **${itemNums[i]}**x **${item?.name}**`));
            let itemRecord = (await Promise.all(items)).join('\n');
            let numberFormatter = new Intl.NumberFormat('en-US', {style: 'decimal'});
            return {
                name: `Level ${i + 2} - ${numberFormatter.format(qp)} QP`,
                value : `${itemRecord}\n`
            }
        })
        return Promise.all(words);
    }

    createEmbeds = async (dataset : Servant) : Promise<MessageEmbed[]> => {
        const { name, id, activeSkill } = dataset;
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
        const td = (await Promise.all(
            svtTdMapping.map(
                a => JP.mstTreasureDevice.findOne({ id: a.treasureDeviceId }).exec()
            )
        )).sort((a, b) => a.id - b.id);
    
        // overwrite name
        svt.name = name;
        let base = () => this.servantBase(svt, __class.name, Math.max(...limits.map(_ => _.rarity)));
    
        let tdEmbed = (await Promise.all(td.map(this.treasureDeviceBase))).map((a, i) => 
            base()
                .addFields(a)
                .setDescription(
                    `[__${td[i].rank}__] `
                    + `[**${td[i].name}** [**__${td[i].typeText}__**]](${
                        `https://apps.atlasacademy.io/db/#/JP/noble-phantasm/${td[i].id}`
                    })`
                )
                .setFooter(`Noble Phantasm`)
        )
    
        let passives = await Promise.all(classPassive.map(_ => this.renderSkill_asSingleLevel(_)));
        let ascItems = await this.renderAscensionItems(
            await this.JP.mstCombineLimit.find({ id: baseSvtId }).limit(5).exec()
        );
        let skillItems = await this.renderSkillItems(
            await this.JP.mstCombineSkill.find({ id: baseSvtId }).limit(9).exec()
        );
        return [
            base()
                .addFields(this.servantDashboard(svt, limits, cards, td_npGain))
                .setFooter(`Basic details`),
            base()
                .addFields([this.traits(svt)]).setFooter('Traits'),
            // cover case where no ascension material
            (ascItems.length
            ? base().addFields(ascItems).setFooter(`Ascension materials`)
            : base().setDescription(`No materials needed.`).setFooter(`Ascension materials`)),
            base()
                .addFields(skillItems).setFooter(`Skill materials`),
            base()
            .addField(
                'Active skill',
                activeSkill.map(a => {
                    const upgrades = a.length, { name, rank, detail, condition } = a.pop();
                    return (
                        `**${name}** __[${rank}]__` + (upgrades > 1 ? ` (${upgrades} upgrades)` : '')
                        + `\n${detail}`
                        + `\n_${condition}_`
                    )
                }).join('\n\n')
            )
            .setFooter(`Active skills`),
            base().addFields(passives).setFooter(`Passive skills`),
            ...tdEmbed
        ]
        .map((a, i, _) => a.setFooter(`${
            a.footer?.text ? `${a.footer.text} • ` : ''
        }Page ${++i}/${_.length}`));
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
                let resultsPromise = Promise.all(
                    skillIds.map(id => this.renderSkill_asSingleLevel(id, {
                        showTeam: false, showChance: false, newline: false, addLink: false, level: 0
                    }))
                )
                let results = await resultsPromise;
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
}