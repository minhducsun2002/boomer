import m from 'mongoose';
import { config } from 'dotenv'; 
m.set('useNewUrlParser', true);
m.set('useFindAndModify', false);
m.set('useUnifiedTopology', true);
m.set('useCreateIndex', true);
config();