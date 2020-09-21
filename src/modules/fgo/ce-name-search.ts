import mst from './master-data';
import cmp from './complementary-data';
import { FgoModule } from './base';
import { SvtType } from '@pepper/constants/fgo';
import f from 'fuse.js';
import { componentLog } from '@pepper/utils';

type ff = f<{ name: string, id: number, collectionNo: number }>;
type fuzzySearchOpt = Parameters<ff['search']>[1];

export = class extends FgoModule {
    constructor() {
        super(`ce-name-search`);
    }

    require = [new mst().id, new cmp().id];

    private tokens = new Map<string, Set<number>>();
    private fuse : ff;
    private log = new componentLog(`F/GO CE name search`);

    /**
     * Search a CE by name
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
     * Search a CE by name (exact match)
     * @param s Search query
     * @returns A set of CE collectionNo.
     */
    tokenSearch(s : string) {
        return this.tokens.get(s.trim().toLowerCase());
    }

    /**
     * Fuzzy search a CE by name
     * @param s Search query
     */
    async fuzzySearch(s : string, opt? : fuzzySearchOpt) {
        if (!this.fuse) await this.initialize();
        return this.fuse.search(s, Object.assign({}, { shouldSort: true }, opt));
    }

    async initialize() {
        let records = await this.handler.findInstance(mst)
            .JP.mstSvt.find({ type: SvtType.SERVANT_EQUIP })
            .select('name id collectionNo').exec();
        let _ = await this.handler.findInstance(cmp).svtObject.find({}).select('name id').exec();
        let m = new Map(_.map(a => [a.id, a.name]));
        for (let r of records) r.name = m.get(r.id) ?? r.name;
        let index = f.createIndex(['name'], records);
        this.fuse = new f(
            records,
            {
                keys: ['name'],
                includeScore: true,
                minMatchCharLength: 1,
                ignoreLocation: true
            },
            index
        );
        this.log.success(`CE name indexing complete.`)
    }
}