import mongoose from 'mongoose';
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useUnifiedTopology', true);

import _FGO = require('./fgo')
export const FGO = _FGO;
import _AL = require('./al')
export const AL = _AL
