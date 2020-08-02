import { FgoModule } from './base';
import { componentLog } from '@pepper/utils';
import m from 'mongoose';
import f from 'fuse.js';

interface Servant extends m.Document {
    name: string;
    alias: string[];
    id: number;
}

const Schema : m.Schema<Servant> = new m.Schema({ name: String, alias: [String], id: Number });

export = class extends FgoModule {
    constructor() {
        super(`servant-name-search`, {});
    }

    private log = new componentLog('F/GO name search');
    private fuse : f<Servant>;

    /**
     * Search a servant by name
     * @param s Search query
     */
    async search(s : string) {
        if (!this.fuse || !this.initialized) await this.initialize();
        return this.fuse.search(s);
    }

    private async verifyDupes(s : Servant[]) {
        let _ = s.map(s => [s.name, ...s.alias]).flat();
        let _1 = new Set(_).size;
        if (_1 !== _.length)
            this.log.warning(
                `There are ${_.length} names/aliases listed, but only ${_1} unique aliases.`
                + `\nPlease remove duplicates for search determinism.`
            )
    }

    initialized = false;
    async initialize() {
        let { main } = this.client.config.database.fgo as { [k: string]: string };
        m.set('useNewUrlParser', true);
        m.set('useFindAndModify', false);
        m.set('useUnifiedTopology', true);
        let mod : m.Model<Servant> = m.createConnection(main)
            .on('open', () => this.log.success(`Connection to alias database succeeded.`))
            .model('Servant', Schema)
        let records = await mod.find({}).select('name alias id').exec();
        this.log.info(`Found aliases for ${records.length} servants.`);

        // warning for dupes sh*t
        this.verifyDupes(records);

        // building index
        let index = f.createIndex(['name', 'alias'], records);
        this.fuse = new f(
            records,
            {
                keys: ['name', {
                    name: 'alias',
                    weight: 1.5
                }],
                includeScore: true,
                minMatchCharLength: 3,
                ignoreLocation: true
            },
            index
        );
        this.log.success(`Servant aliases indexing complete.`)
        this.initialized = true;
    }
}