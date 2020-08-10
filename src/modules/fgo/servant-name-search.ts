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

    private log = new componentLog('F/GO servant name search');
    private fuse : f<Servant>;
    private tokens = new Map<string, Set<number>>();

    /**
     * Search a servant by name
     * @param s Search query
     */
    async search(s : string) {
        if (!this.fuse || !this.initialized) await this.initialize();
        return this.fuse.search(s);
    }

    /**
     * Search a servant by name (exact match)
     * @param s Search query
     * @returns A set of servant collectionNo.
     */
    tokenSearch(s : string) {
        return this.tokens.get(s.trim().toLowerCase());
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
        let mod : m.Model<Servant> = m.createConnection(main)
            .on('open', () => this.log.success(`Connection to alias database succeeded.`))
            .model('Servant', Schema)
        let records = await mod.find({}).select('name alias id').exec();
        this.log.info(`Found aliases for ${records.length} servants.`);

        // warning for dupes sh*t
        this.verifyDupes(records);

        // preparing for token-based search
        records.map(r => ({
            token: [r.alias, r.name].flat().map(_ => _.toLowerCase()),
            id: r.id
        })).forEach(_ => {
            // for each aliases
            let t = _.token, { id } = _;
            // register aliases
            t.forEach(token => {
                if (this.tokens.has(token))
                    this.tokens.get(token).add(id);
                else
                    this.tokens.set(token, new Set([id]))
            })
        })
        this.log.success(`Servant aliases tokenization complete.`);

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