import mst from './master-data';
import { FgoModule } from './base';

export = class extends FgoModule {
    constructor() {
        super(`servant-trait-get`);
    }

    require = [new mst().id];
    // trait => [servants]
    private NA = new Map<number, Set<number>>();
    private JP = new Map<number, Set<number>>();

    /**
     * Search for servants containing this trait
     * @param t Trait to search for
     * @param region Region to search
     */
    trait(t : number, region : 'NA' | 'JP' = 'JP') {
        switch (region) {
            case 'NA': return [...this.NA.get(t)];
            default:
            case 'JP': return [...this.JP.get(t)];
        }
    }

    async initialize() {
        let m = this.handler.findInstance(mst);
        let [NA, JP] = await Promise.all(
            [m.NA, m.JP]
            .map(m => m.mstSvt.find({ $or: [{ type: 2 }, { type: 1 }] }).select('collectionNo individuality').exec())
        )
        for (let s of NA) 
            for (let trait of s.individuality) 
                (this.NA.has(trait) ? this.NA : this.NA.set(trait, new Set<number>()))
                    .get(trait).add(s.collectionNo);
            
        for (let s of JP) 
            for (let trait of s.individuality) 
                (this.JP.has(trait) ? this.JP : this.JP.set(trait, new Set<number>()))
                    .get(trait).add(s.collectionNo);
    }
}