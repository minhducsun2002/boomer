import { createConnection, Connection, Model } from 'mongoose';
import { log } from '../../lib/logger';
import cfg from '../../config';

function a (s: string) { return `[F/GO] ${s}` }

// models
import { Servant, ServantSchema } from './model';
import { mstSvtSchema, mstSvtDocument } from './master/mstSvt';
import { mstClassSchema, mstClassDocument } from './master/mstClass';
import { mstAttriRelationSchema, mstAttriRelationDocument } from './master/mstAttriRelation';
import { mstQuestSchema, mstQuestDocument } from './master/mstQuest'

export const connections = new Map<string, Connection>()

const main = createConnection(cfg.get('database:main'))
    .on('open', () => log.success(a(`Successfully connected to main database.`)));
const master = {
    NA: createConnection(cfg.get('database:masterData:NA'))
        .on('open', () => log.success(a(`Successfully connected to master (NA) database.`))),
    JP: createConnection(cfg.get('database:masterData:JP'))
        .on('open', () => log.success(a(`Successfully connected to master (JP) database.`)))
}

connections
    .set('main', main)
    .set('master_NA', master.NA)
    .set('master_JP', master.JP)

export const ServantModel : Model<Servant> = connections.get('main').model('Servant', ServantSchema)

export const NA = {
    mstSvt: master.NA.model('mstSvt', mstSvtSchema, 'mstSvt') as Model<mstSvtDocument>,
    mstClass: master.NA.model('mstClass', mstClassSchema, 'mstClass') as Model<mstClassDocument>,
    mstAttriRelation: master.NA.model('mstAttriRelation', mstAttriRelationSchema, 'mstAttriRelation') as Model<mstAttriRelationDocument>,
    mstQuest: master.NA.model('mstQuest', mstQuestSchema, 'mstQuest') as Model<mstQuestDocument>
}
export const JP = {
    mstSvt: master.JP.model('mstSvt', mstSvtSchema, 'mstSvt') as Model<mstSvtDocument>,
    mstClass: master.JP.model('mstClass', mstClassSchema, 'mstClass') as Model<mstClassDocument>,
    mstAttriRelation: master.JP.model('mstAttriRelation', mstAttriRelationSchema, 'mstAttriRelation') as Model<mstAttriRelationDocument>,
    mstQuest: master.JP.model('mstQuest', mstQuestSchema, 'mstQuest') as Model<mstQuestDocument>
}