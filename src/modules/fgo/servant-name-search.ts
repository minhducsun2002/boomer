import { FgoModule } from './base';
import { componentLog } from '@pepper/utils';
import f from 'fuse.js';
import db, { Servant } from './servant-main-database';

type fuzzySearchOpt = Parameters<f<Servant>['search']>[1];

export = class extends FgoModule {
    constructor() {
        super(`servant-name-search`, {});
    }

    private log = new componentLog('F/GO servant name search');
    private fuse : f<Servant>;
    private tokens = new Map<string, Set<number>>();

    private _records : Servant[];
    public get records() { return this._records };
    
    /**
     * Search a servant by name
     * @param s Search query
     */
    async search(s : string, opt? : fuzzySearchOpt) {
        let t = this.tokenSearch(s);
        let res = await this.fuzzySearch(s, opt);
        if (t?.size) {
            // instead of removing, prioritise
            let match = [] as typeof res, mis = [] as typeof res;
            // res = res.filter(_ => t.has(_.item.id))
            for (let r of res) 
                (t.has(r.item.id) ? match : mis).push(r);
            res = [...match.sort((a, b) => a.score - b.score), ...mis];
        }
        return res;
    }

    /**
     * Search a servant by name (exact match)
     * @param s Search query
     * @returns A set of servant collectionNo.
     */
    tokenSearch(s : string) {
        return this.tokens.get(s.trim().toLowerCase());
    }

    /**
     * Fuzzy search a servant by name
     * @param s Search query
     */
    async fuzzySearch(s : string, opt? : fuzzySearchOpt) {
        if (!this.fuse || !this.initialized) await this.initialize();
        return this.fuse.search(s, Object.assign({}, { shouldSort: true }, opt));
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

    require = [new db().id];

    initialized = false;
    async initialize() {
        let c = this.handler.findInstance(db);
        let records = await c.query({}).select('name alias id class rarity').exec();
        this._records = records;
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