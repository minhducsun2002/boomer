import dotenv = require('dotenv'); dotenv.config();
import mongoose = require('mongoose');
import chalk = require('chalk');

let log : Function = (t : String) => console.log(chalk.bgYellow.white('[Database]') + ' ' + t);

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);

mongoose.connection.once('open', () => log('Database is ready.'))

export = async () : Promise<typeof mongoose> => {
    if (!process.env.MONGODB_URI) {
        throw new Error('No URI present, this bot will not work!')
    }
    else {
        return mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
            .catch(err => {
                console.log(log('[DATABASE]') + ' Connection failed. The scraping process will not be executed.');
                throw err;
            })
    }
}

