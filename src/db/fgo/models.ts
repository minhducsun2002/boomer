import type { Connection, Model } from 'mongoose';

import { Servant, ServantSchema } from './main';

import { mstSvtSchema, mstSvtDocument } from './master/mstSvt';
import { mstClassSchema, mstClassDocument } from './master/mstClass';
import { mstAttriRelationSchema, mstAttriRelationDocument } from './master/mstAttriRelation';
import { mstQuestSchema, mstQuestDocument } from './master/mstQuest';
import { mstSpotSchema, mstSpotDocument } from './master/mstSpot';
import { mstWarSchema, mstWarDocument } from './master/mstWar';
import { mstSvtCardSchema,  mstSvtCardDocument } from './master/mstSvtCard';
import { mstSvtCommentSchema,  mstSvtCommentDocument } from './master/mstSvtComment';
import { mstSvtSkillSchema,  mstSvtSkillDocument } from './master/mstSvtSkill';
import { mstSkillDetailSchema,  mstSkillDetailDocument } from './master/mstSkillDetail';
import { mstItemSchema,  mstItemDocument } from './master/mstItem';
import { mstQuestConsumeItemSchema,  mstQuestConsumeItemDocument } from './master/mstQuestConsumeItem';
import { mstQuestPhaseSchema, mstQuestPhaseDocument } from './master/mstQuestPhase';
import { mstSvtLimitSchema, mstSvtLimitDocument } from './master/mstSvtLimit';
import { mstSvtTreasureDeviceSchema, mstSvtTreasureDeviceDocument } from './master/mstSvtTreasureDevice';
import { mstTreasureDeviceLvSchema, mstTreasureDeviceLvDocument } from './master/mstTreasureDeviceLv';
import { mstTreasureDeviceSchema, mstTreasureDeviceDocument } from './master/mstTreasureDevice';
import { mstFuncSchema, mstFuncDocument } from './master/mstFunc';
import { mstBuffSchema, mstBuffDocument } from './master/mstBuff';
import { mstSkillSchema, mstSkillDocument } from './master/mstSkill';
import { mstSkillLvSchema, mstSkillLvDocument } from './master/mstSkillLv';
import { mstCombineLimit, mstCombineLimitSchema } from './master/mstCombineLimit';
import { mstCombineSkill, mstCombineSkillSchema } from './master/mstCombineSkill';

export const initializeMasterModels = (conn : Connection) => ({
    mstSvt: conn.model('mstSvt', mstSvtSchema, 'mstSvt') as Model<mstSvtDocument>,
    mstClass: conn.model('mstClass', mstClassSchema, 'mstClass') as Model<mstClassDocument>,
    mstAttriRelation: conn.model('mstAttriRelation', mstAttriRelationSchema, 'mstAttriRelation') as Model<mstAttriRelationDocument>,
    mstQuest: conn.model('mstQuest', mstQuestSchema, 'mstQuest') as Model<mstQuestDocument>,
    mstSpot: conn.model('mstSpot', mstSpotSchema, 'mstSpot') as Model<mstSpotDocument>,
    mstWar: conn.model('mstWar', mstWarSchema, 'mstWar') as Model<mstWarDocument>,
    mstSvtCard: conn.model('mstSvtCard', mstSvtCardSchema, 'mstSvtCard') as Model<mstSvtCardDocument>,
    mstSvtComment: conn.model('mstSvtComment', mstSvtCommentSchema, 'mstSvtComment') as Model<mstSvtCommentDocument>,
    mstSvtSkill: conn.model('mstSvtSkill', mstSvtSkillSchema, 'mstSvtSkill') as Model<mstSvtSkillDocument>,
    mstSkillDetail: conn.model('mstSkillDetail', mstSkillDetailSchema, 'mstSkillDetail') as Model<mstSkillDetailDocument>,
    mstItem: conn.model('mstItem', mstItemSchema, 'mstItem') as Model<mstItemDocument>,
    mstQuestConsumeItem: conn.model('mstQuestConsumeItem', mstQuestConsumeItemSchema, 'mstQuestConsumeItem') as Model<mstQuestConsumeItemDocument>,
    mstQuestPhase: conn.model('mstQuestPhase', mstQuestPhaseSchema, 'mstQuestPhase') as Model<mstQuestPhaseDocument>,
    mstSvtLimit: conn.model('mstSvtLimit', mstSvtLimitSchema, 'mstSvtLimit') as Model<mstSvtLimitDocument>,
    mstSvtTreasureDevice: conn.model('mstSvtTreasureDevice', mstSvtTreasureDeviceSchema, 'mstSvtTreasureDevice') as Model<mstSvtTreasureDeviceDocument>,
    mstTreasureDeviceLv: conn.model('mstTreasureDeviceLv', mstTreasureDeviceLvSchema, 'mstTreasureDeviceLv') as Model<mstTreasureDeviceLvDocument>,
    mstTreasureDevice: conn.model('mstTreasureDevice', mstTreasureDeviceSchema, 'mstTreasureDevice') as Model<mstTreasureDeviceDocument>,
    mstFunc: conn.model('mstFunc', mstFuncSchema, 'mstFunc') as Model<mstFuncDocument>,
    mstBuff: conn.model('mstBuff', mstBuffSchema, 'mstBuff') as Model<mstBuffDocument>,
    mstSkill: conn.model('mstSkill', mstSkillSchema, 'mstSkill') as Model<mstSkillDocument>,
    mstSkillLv: conn.model('mstSkillLv', mstSkillLvSchema, 'mstSkillLv') as Model<mstSkillLvDocument>,
    mstCombineLimit: conn.model('mstCombineLimit', mstCombineLimitSchema, 'mstCombineLimit') as Model<mstCombineLimit>,
    mstCombineSkill: conn.model('mstCombineSkill', mstCombineSkillSchema, 'mstCombineSkill') as Model<mstCombineSkill>
})

export const initializeServantModel = (c : Connection) => c.model('Servant', ServantSchema) as Model<Servant>
