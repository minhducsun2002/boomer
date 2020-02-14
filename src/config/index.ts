import { file } from 'nconf';
import { join } from 'path';

export default file(join(
    join(process.cwd(), 'config'),
    (process.env.NODE_ENV ?? 'development') + '.json'
))