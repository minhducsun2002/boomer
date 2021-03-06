import { FgoModule } from './base';
import { componentLog } from '@pepper/utils';
import f from 'fuse.js';
import { Schema, Document, createConnection, Model } from 'mongoose';
import aliases from './servant-aliases';

type Servant = { id: number, name: string, aliases: string[] };
type fuzzySearchOpt = Parameters<f<Servant>['search']>[1];


interface AliasEntry extends Document {
    /** Servant collectionNo. */
    collectionNo: number;
    /** Alias of this servant. */
    alias: string;
    /** When this entry was added. `new Date.toJSON()`. */
    addedAt: string;
    /** ID of user who added. */
    creator: string;
}
const nameSchema = new Schema<AliasEntry>({
    collectionNo: Number, alias: { type: String, unique: true }, addedAt: String, creator: String
});


export = class extends FgoModule {
    constructor() {
        super(`servant-name-search`, {});
    }

    private log = new componentLog('F/GO servant name search');
    private fuse : f<Servant>;
    private tokens = new Map<string, Set<number>>();
    public records : Servant[];

    private aliasModel:  Model<AliasEntry>;

    /**
     * Search a servant by name
     * @param s Search query
     */
    search(s : string, opt? : fuzzySearchOpt) {
        s = s.toLowerCase();
        let t = this.tokenSearch(s);
        let res = this.fuse.search(s, Object.assign({}, { shouldSort: true }, opt));
        if (t?.size) {
            // instead of removing, prioritise
            let match = [] as typeof res, mis = [] as typeof res;
            for (let r of res)
                (t.has(r.item.id) ? match : mis).push(r);
            res = [...match.sort((a, b) => {
                // compare by bucket count first
                if (t.get(a.item.id) != t.get(b.item.id))
                    return t.get(b.item.id) - t.get(a.item.id);
                // if bucket count is the same, rely on score
                return a.score - b.score;
            }), ...mis];
        }
        return res;
    }

    /**
     * Search a servant by name (exact match)
     * @param s Search query
     * @returns A set of servant collectionNo.
     */
    tokenSearch(s : string) {
        let queries = s.replace(/\s/g, ' ').split(' ').filter(Boolean);
        let results = queries.map(q => this.tokens.get(q)).filter(Boolean);
        // split a query into an array of strings, called `tokens`
        // get all servant IDs linked to a token, discarding tokens that link to no servants
        let servants = new Set(results.map(tokenSet => [...tokenSet]).flat());
        // sort all servants based on the number of buckets they appear in
        let occurences = [...servants]
            .map(
                s => ({
                    id: s,
                    count: results.reduce((count, tokenSet) => count + (+!!tokenSet.has(s)), 0)
                })
            )
            // sort descending
            .sort((a, b) => b.count - a.count)

        return new Map(occurences.map(({ id, count }) => [id, count]));
    }

    private async verifyDupes(s : Servant[]) {
        let _ = s.map(s => [s.name, ...s.aliases]).flat();
        let _1 = new Set(_).size;
        if (_1 !== _.length)
            this.log.warning(
                `There are ${_.length} names/aliases listed, but only ${_1} unique aliases.`
                + `\nPlease remove duplicates for search determinism.`
            )
    }

    async getAlias(query: string) {
        return await this.aliasModel.findOne({ alias: query.toLowerCase() }).exec();
    }

    async pushAlias(collectionNo: number, alias: string, creator: string) {
        return await this.aliasModel.create({ collectionNo, alias: alias.toLowerCase(), creator, addedAt: new Date().toJSON() })
    }

    async listAlias(collectionNo: number) {
        return await this.aliasModel.find({ collectionNo }).exec();
    }

    require = [new aliases().id];

    async initialize() {
        this.initializeAlias();

        let c = this.handler.findInstance(aliases);
        let aliases2 = this.records = [...c.cache.entries()]
            .map(record => ({ id: record[0], name: record[1].name, aliases: record[1].aliases.map(_ => _.toLowerCase()) }));
        this.log.info(`Found aliases for ${aliases2.length} servants.`);

        // warning for dupes sh*t
        this.verifyDupes(aliases2);

        for (let entry of aliases2) {
            let tokens = [entry.aliases, entry.name].flat()
                .map(a => a.replace(/\(/g, '').replace(/\)/g, ''))
                .map(a => a.toLowerCase())
                .map(a => a.split(' ').filter(Boolean))
                .flat();
            for (let token of tokens)
                if (this.tokens.has(token))
                    this.tokens.get(token).add(entry.id);
                else
                    this.tokens.set(token, new Set([entry.id]));
        }

        this.log.success(`Servant aliases tokenization complete.`);

        // building index
        let index = f.createIndex(['name', 'aliases'], aliases2);
        this.fuse = new f(
            aliases2,
            {
                keys: ['name', {
                    name: 'aliases',
                    weight: 1.5
                }],
                includeScore: true,
                minMatchCharLength: 1,
                ignoreLocation: true
            },
            index
        );
        this.log.success(`Servant aliases indexing complete.`)
    }

    private initializeAlias() {
        let { servant_aliases } = this.client.config.database.fgo as { [k: string]: string };
        this.aliasModel = createConnection(servant_aliases)
            .on('open', () => this.log.success(`Connected to servant alias database.`))
            .model('names', nameSchema);
    }
}
