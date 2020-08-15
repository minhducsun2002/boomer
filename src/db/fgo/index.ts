import { createConnection } from 'mongoose';
import mongoose from 'mongoose';
import { componentLog } from '@pepper/utils';
import cfg from '../../config';
import { initializeMasterModels as _, initializeServantModel } from './models';

require('mongoose-cache').install(mongoose, { max: 300, maxAge: 1000 * 60 * 60 * 30 }, mongoose.Aggregate)

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useUnifiedTopology', true);

const log = new componentLog('Database');

function a (s: string) { return `[F/GO] ${s}` }

const prefix = 'database:fgo'

const main = createConnection(cfg.get(`${prefix}:main`))
    .on('open', () => log.success(a(`Successfully connected to main database.`)));
const master = {
    NA: createConnection(cfg.get(`${prefix}:masterData:NA`))
        .on('open', () => log.success(a(`Successfully connected to master (NA) database.`))),
    JP: createConnection(cfg.get(`${prefix}:masterData:JP`))
        .on('open', () => log.success(a(`Successfully connected to master (JP) database.`)))
}

export const ServantModel = initializeServantModel(main);
export const NA = _(master.NA), JP = _(master.JP)
export type DBInstance = ReturnType<typeof _>;