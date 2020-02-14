import { config } from 'dotenv'; config();
import { createConnection, Connection, Model } from 'mongoose'; import mongoose from 'mongoose';
// yikes, 
// TypeError: mongoose_1.createConnection is not a function
import { log } from '../lib/logger';
import cfg from '../config';

// models
import { Servant, ServantSchema } from './model';
import { mstSvtSchema, mstSvtDocument } from './master/mstSvt';

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useUnifiedTopology', true);

export const connections = new Map<string, Connection>()

const main = createConnection(cfg.get('database:main'))
    .on('open', () => log.success(`Successfully connected to main database.`));
const master = {
    NA: createConnection(cfg.get('database:masterData:NA'))
        .on('open', () => log.success(`Successfully connected to master (NA) database.`)),
    JP: createConnection(cfg.get('database:masterData:JP'))
        .on('open', () => log.success(`Successfully connected to master (JP) database.`))
}

connections
    .set('main', main)
    .set('master_NA', master.NA)
    .set('master_JP', master.JP)

export const ServantModel : Model<Servant> = connections.get('main').model('Servant', ServantSchema)
export const mstSvtModel = {
    NA: connections.get('master_NA').model('mstSvt', mstSvtSchema, 'mstSvt') as Model<mstSvtDocument>,
    JP: connections.get('master_JP').model('mstSvt', mstSvtSchema, 'mstSvt') as Model<mstSvtDocument>
}