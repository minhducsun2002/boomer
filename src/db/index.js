require('dotenv').config()
const mongoose = require('mongoose');
const chalk = require('chalk')

const log = (...arg) => chalk.bgYellow.white(...arg);

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);

mongoose.connection.once('open', () => console.log(log('[DATABASE]') + ' Database is ready.'))

const connect = async () => {
    if (!process.env.MONGODB_URI) {
        console.log(log('[DATABASE]') + ' No URI present. The scraping process will not be executed.');
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

module.exports = connect
