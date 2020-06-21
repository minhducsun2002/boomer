import mongoose from 'mongoose';

// let's patch
// 30 days?
require('mongoose-cache').install(mongoose, { max: 300, maxAge: 1000 * 60 * 60 * 30 }, mongoose.Aggregate)

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useUnifiedTopology', true);

import _FGO = require('./fgo')
export const FGO = _FGO;
