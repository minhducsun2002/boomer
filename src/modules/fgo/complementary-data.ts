import { componentLog } from '@pepper/utils';
import { FgoModule } from './base';
import { createConnection, Schema, Document, Model } from 'mongoose';

interface SvtObject extends Document {
    name: string; id: number;
}

const object = new Schema<SvtObject>({ name: String, id: Number });

interface Item extends Document {
    name: string; id: number;
}
const item = new Schema<Item>({ name: String, id: Number });

export = class extends FgoModule {
    constructor() {
        super(`complementary-data`)
    }

    svtObject: Model<SvtObject>;
    item: Model<Item>;
    private log = new componentLog(`F/GO localized names`);

    async initialize() {
        let _ = this.client.config.database['fgo'];
        let { english_names } = (_ as Exclude<typeof _, string>)['complementary'] as { [k: string]: string };
        const conn = createConnection(english_names)
            .on(`open`, () => this.log.success(`Connected to localized name collection.`))
        this.svtObject = conn.model('svt', object, 'svt');
        this.item = conn
            .model('items', item, 'items');
    }
}