import { createConnection } from 'mongoose';
import m from 'mongoose';
import { cpus } from 'os';
import cfg from '../../src/config';
import { initializeMasterModels, initializeServantModel } from '../../src/db/fgo/models'
import { createEmbeds } from '../../src/lib/fgo';
import { componentLog } from '../../src/utils';
import { Queue } from 'queue-ts';

let log = new componentLog('Servant details renderer');
let prefix = `database:fgo`, masterPrefix = `masterData`;

m.set('useNewUrlParser', true);
m.set('useFindAndModify', false);
m.set('useUnifiedTopology', true);

process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled rejection at :', promise, '\nReason :', reason);
    process.exit(1);
});

const main = createConnection(cfg.get(`${prefix}:main`));
const master = {
    NA: createConnection(cfg.get(`${prefix}:${masterPrefix}:NA`)),
    JP: createConnection(cfg.get(`${prefix}:${masterPrefix}:JP`))
}

let servant = initializeServantModel(main),
    NA = initializeMasterModels(master.NA),
    JP = initializeMasterModels(master.JP)

let q = new Queue(Math.max(16, cpus().length * 2));
servant.find({}).select('name id activeSkill').exec().then(_ => {
    _.sort((a, b) => (+a.id) - (+b.id)).forEach(
        s => q.add(() => {
            return createEmbeds(s, NA, JP)
                .then(() => log.success(`Processing complete for servant ${s.id} - ${s.name}`))
                .catch(e => log.error(`Processing failed   for servant ${s.id} - ${s.name}:\n${e.stack}`))
        })
    )
})

q.onEmpty(() => {
    main.close();
    master.NA.close();
    master.JP.close();
});