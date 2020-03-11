import { createConnection, Connection, Model } from 'mongoose';
import { log } from '../../lib/logger';
import cfg from '../../config';

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

export const ServantModel : Model<Servant> = connections.get('main').model('Servant', ServantSchema)

const _ = (s : keyof typeof master) => ({
    mstSvt: master[s].model('mstSvt', mstSvtSchema, 'mstSvt') as Model<mstSvtDocument>,
    mstClass: master[s].model('mstClass', mstClassSchema, 'mstClass') as Model<mstClassDocument>,
    mstAttriRelation: master[s].model('mstAttriRelation', mstAttriRelationSchema, 'mstAttriRelation') as Model<mstAttriRelationDocument>,
    mstQuest: master[s].model('mstQuest', mstQuestSchema, 'mstQuest') as Model<mstQuestDocument>,
    mstSpot: master[s].model('mstSpot', mstSpotSchema, 'mstSpot') as Model<mstSpotDocument>,
    mstWar: master[s].model('mstWar', mstWarSchema, 'mstWar') as Model<mstWarDocument>,
    mstSvtCard: master[s].model('mstSvtCard', mstSvtCardSchema, 'mstSvtCard') as Model<mstSvtCardDocument>,
    mstSvtComment: master[s].model('mstSvtComment', mstSvtCommentSchema, 'mstSvtComment') as Model<mstSvtCommentDocument>,
    mstSvtSkill: master[s].model('mstSvtSkill', mstSvtSkillSchema, 'mstSvtSkill') as Model<mstSvtSkillDocument>,
    mstSkillDetail: master[s].model('mstSkillDetail', mstSkillDetailSchema, 'mstSkillDetail') as Model<mstSkillDetailDocument>,
    mstItem: master[s].model('mstItem', mstItemSchema, 'mstItem') as Model<mstItemDocument>,
    mstQuestConsumeItem: master[s].model('mstQuestConsumeItem', mstQuestConsumeItemSchema, 'mstQuestConsumeItem') as Model<mstQuestConsumeItemDocument>
})

export const NA = _('NA'), JP = _('JP')