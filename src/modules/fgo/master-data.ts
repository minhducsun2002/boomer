import { initializeMasterModels } from '@pepper/db/fgo/models';
import { FgoModule } from './base';
import { createConnection } from 'mongoose';
import { componentLog } from '@pepper/utils';

export = class extends FgoModule {
    constructor() {
        super(`master-data`);
    }

    private log = new componentLog('F/GO master DB');

    NA: ReturnType<typeof initializeMasterModels>;
    JP: ReturnType<typeof initializeMasterModels>;

    async initialize() {
        let cfg = this.client.config.database.fgo;
        let mst = (cfg as Exclude<typeof cfg, string>).masterData;
        let { NA, JP } = mst as { [k: string]: string };
        this.NA = initializeMasterModels(
            createConnection(NA)
                .on(`open`, () => this.log.success(`Connected to NA master DB.`))
        )
        this.JP = initializeMasterModels(
            createConnection(JP)
                .on(`open`, () => this.log.success(`Connected to JP master DB.`))
        );
    }
}