import dotenv = require('dotenv'); dotenv.config();
import mongoose = require('mongoose');
import { log } from '../lib/logger';

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);

// mongoose.connection.once('open', () => log.success('Database is ready.'))

export = async () : Promise<typeof mongoose> => {
    if (!process.env.MONGODB_URI) {
        throw new Error('No URI present, this bot will not work!')
    }
    else {
        return mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
            .catch(err => {
                log.error('Connection failed.')
                log.error(err)
                throw err;
            })
    }
}

