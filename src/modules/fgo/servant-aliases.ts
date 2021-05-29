import { FgoModule } from './base';
import { componentLog } from '@pepper/utils';
import Axios from 'axios';

export = class extends FgoModule {
    constructor() {
        super(`servant-aliases`, {})
    }

    private log = new componentLog('Servant aliases provider');

    async load() {
        let cfg = this.client.config.database.fgo;
        let { servant_aliases_2 } = cfg as Exclude<typeof cfg, string>;
        let csv = await Axios.get(servant_aliases_2 as string, { responseType: 'text' }).then(_ => _.data as string);
        this.log.success(`Downloaded ${Buffer.from(csv, 'utf8').length} bytes.`);

        let records = csv.split('\n')
            .map(csv => csv.split(','))
            .filter(line => !isNaN(+line[0]) && !isNaN(+line[1]) && line[2] !== '')
            .map(line => [+line[0], { id: +line[1], name: line[2], aliases: line.slice(3).filter(Boolean) }] as const);
        this._cache = new Map(records);
        return records;
    }

    private _cache = new Map<number, { id: number, name: string, aliases: string[] }>();
    public get cache() { return this._cache; }

    async initialize() {
        await this.load().then(res => this.log.success(`Parsed aliases for ${res.length} servants.`));
    }
}