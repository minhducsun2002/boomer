import { QuestType } from '@pepper/constants/fgo';
import Master from './master-data';
import { FgoModule } from './base';
import { componentLog } from '@pepper/utils';
import fuse from 'fuse.js';
import { mstSpot } from '@pepper/db/fgo/master/mstSpot';
import { mstQuest } from '@pepper/db/fgo/master/mstQuest';

type ff = fuse<{ name: string, id: number, quest: mstQuest, spot: mstSpot, spotName: string }>;
type fuzzySearchOpt = Parameters<ff['search']>[1];

export = class extends FgoModule {
    constructor() {
        super('quest-name-search')
    }

    private log = new componentLog("NA free quests name search");
    private tokens = new Map<string, Set<number>>();
    private fuse : ff;
    require = [new Master().id]

    async search(s : string, opt? : fuzzySearchOpt) {
        s = s.toLowerCase();
        let t = this.tokenSearch(s);
        let res = this.fuse.search(s, Object.assign({}, { shouldSort: true }, opt));
        if (t?.size) {
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

    tokenSearch(s : string) {
        // identical method as servant-name-search
        let queries = s.replace(/\s/g, ' ').split(' ').filter(Boolean);
        let results = queries.map(q => this.tokens.get(q)).filter(Boolean);
        let quests = new Set(results.map(tokenSet => [...tokenSet]).flat());
        let occurences = [...quests]
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

    async fuzzySearch(s : string, opt? : fuzzySearchOpt) {
        if (!this.fuse) await this.initialize();
        return this.fuse.search(s, Object.assign({}, { shouldSort: true }, opt));
    }

    async load() {
        let { NA: { mstSpot, mstQuest } } = this.handler.findInstance(Master);
        let spots = await mstSpot.find().exec().then(spots => spots.map(spot => <const>[spot.id, spot]))
            .then(tuples => new Map(tuples));
        this.log.success(`Discovered ${spots.size} spots.`)

        let quests = await mstQuest.find({ type: QuestType.FREE })
            .exec().then(quests => {
                this.log.success(`Discovered ${quests.length} free quests. Matching it into spots...`);
                return quests.map(quest => ({
                    name: quest.name,
                    id: quest.id,
                    quest,
                    spot: spots.get(quest.spotId),
                    spotName: spots.get(quest.spotId).name
                }))
            });

        this.tokens.clear();
        for (let entry of quests) {
            let tokens = [entry.name, entry.spotName]
                .map(a => a.replace(/\(/g, '').replace(/\)/g, ''))
                .map(a => a.toLowerCase())
                .map(a => a.split(' ').filter(Boolean)).flat(1);
            for (let token of tokens) {
                if (this.tokens.has(token))
                    this.tokens.get(token).add(entry.id);
                else
                    this.tokens.set(token, new Set([entry.id]));
            }
        }

        this.fuse = new fuse(
            quests,
            {
                keys: ['name', 'spotName'],
                includeScore: true,
                minMatchCharLength: 1,
                ignoreLocation: true
            },
            fuse.createIndex(['name', 'spotName'], quests)
        );
        this.log.success('Free quest name indexing complete.')
    }

    async initialize() {
        return await this.load();
    }
}