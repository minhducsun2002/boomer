import mongoose from 'mongoose';
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useUnifiedTopology', true);

import * as _FGO from './fgo';
export const FGO = _FGO;
