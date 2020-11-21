import { componentLog } from '@pepper/utils';
import { FgoModule } from './base';
import { createConnection, Schema, Document, Model } from 'mongoose';

interface DataObject extends Document { name: string; id: number; } 
const object = new Schema<DataObject>({ name: String, id: Number });
const item = new Schema<DataObject>({ name: String, id: Number });
export { object, item };
export interface ComplementaryDataModel {
    svtObject: Model<DataObject>;
    item: Model<DataObject>;
}

export default class extends FgoModule implements ComplementaryDataModel {
    constructor() {
        super(`complementary-data`)
    }

    svtObject: Model<DataObject>;
    item: Model<DataObject>;
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