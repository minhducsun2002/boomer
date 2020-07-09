import { createConnection, Connection, Model } from 'mongoose';
import { componentLog } from '@pepper/utils';
import cfg from '../../config';

const log = new componentLog('Database');

function a (s: string) { return `[F/GO] ${s}` }

export const connections = new Map<string, Connection>()

const prefix = 'database:fgo'

const main = createConnection(cfg.get(`${prefix}:main`))
    .on('open', () => log.success(a(`Successfully connected to main database.`)));
const master = {
    NA: createConnection(cfg.get(`${prefix}:masterData:NA`))
        .on('open', () => log.success(a(`Successfully connected to master (NA) database.`))),
    JP: createConnection(cfg.get(`${prefix}:masterData:JP`))
        .on('open', () => log.success(a(`Successfully connected to master (JP) database.`)))
}

connections
    .set('main', main)
    .set('master_NA', master.NA)
    .set('master_JP', master.JP)

// models
import { Servant, ServantSchema } from './model';
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

export const ServantModel : Model<Servant> = connections.get('main').model('Servant', ServantSchema)

const _ = (s : keyof typeof master) => {
    let __ = master[s];
    return {
        mstSvt: __.model('mstSvt', mstSvtSchema, 'mstSvt') as Model<mstSvtDocument>,
        mstClass: __.model('mstClass', mstClassSchema, 'mstClass') as Model<mstClassDocument>,
        mstAttriRelation: __.model('mstAttriRelation', mstAttriRelationSchema, 'mstAttriRelation') as Model<mstAttriRelationDocument>,
        mstQuest: __.model('mstQuest', mstQuestSchema, 'mstQuest') as Model<mstQuestDocument>,
        mstSpot: __.model('mstSpot', mstSpotSchema, 'mstSpot') as Model<mstSpotDocument>,
        mstWar: __.model('mstWar', mstWarSchema, 'mstWar') as Model<mstWarDocument>,
        mstSvtCard: __.model('mstSvtCard', mstSvtCardSchema, 'mstSvtCard') as Model<mstSvtCardDocument>,
        mstSvtComment: __.model('mstSvtComment', mstSvtCommentSchema, 'mstSvtComment') as Model<mstSvtCommentDocument>,
        mstSvtSkill: __.model('mstSvtSkill', mstSvtSkillSchema, 'mstSvtSkill') as Model<mstSvtSkillDocument>,
        mstSkillDetail: __.model('mstSkillDetail', mstSkillDetailSchema, 'mstSkillDetail') as Model<mstSkillDetailDocument>,
        mstItem: __.model('mstItem', mstItemSchema, 'mstItem') as Model<mstItemDocument>,
        mstQuestConsumeItem: __.model('mstQuestConsumeItem', mstQuestConsumeItemSchema, 'mstQuestConsumeItem') as Model<mstQuestConsumeItemDocument>,
        mstQuestPhase: __.model('mstQuestPhase', mstQuestPhaseSchema, 'mstQuestPhase') as Model<mstQuestPhaseDocument>,
        mstSvtLimit: __.model('mstSvtLimit', mstSvtLimitSchema, 'mstSvtLimit') as Model<mstSvtLimitDocument>,
        mstSvtTreasureDevice: __.model('mstSvtTreasureDevice', mstSvtTreasureDeviceSchema, 'mstSvtTreasureDevice') as Model<mstSvtTreasureDeviceDocument>,
        mstTreasureDeviceLv: __.model('mstTreasureDeviceLv', mstTreasureDeviceLvSchema, 'mstTreasureDeviceLv') as Model<mstTreasureDeviceLvDocument>,
        mstTreasureDevice: __.model('mstTreasureDevice', mstTreasureDeviceSchema, 'mstTreasureDevice') as Model<mstTreasureDeviceDocument>,
        mstFunc: __.model('mstFunc', mstFuncSchema, 'mstFunc') as Model<mstFuncDocument>,
        mstBuff: __.model('mstBuff', mstBuffSchema, 'mstBuff') as Model<mstBuffDocument>,
    }
}

export const NA = _('NA'), JP = _('JP')