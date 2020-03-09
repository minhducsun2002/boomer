import mongoose from 'mongoose';

// let's patch
require('mongoose-cache').install(mongoose, { max: 50, maxAge: 1000 * 45 }, mongoose.Aggregate)

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useUnifiedTopology', true);

import _FGO = require('./fgo')
export const FGO = _FGO;
import _AL = require('./al')
export const AL = _AL
