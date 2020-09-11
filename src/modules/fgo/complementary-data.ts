import { componentLog } from '@pepper/utils';
import { FgoModule } from './base';
import { createConnection, Schema, Document, Model } from 'mongoose';

interface EnglishNames extends Document {
    name: string; id: number;
}

const schema = new Schema<EnglishNames>({ name: String, id: Number });

export = class extends FgoModule {
    constructor() {
        super(`complementary-data`)
    }

    englishNames: Model<EnglishNames>;
    private log = new componentLog(`F/GO complementary data`);

    async initialize() {
        let _ = this.client.config.database['fgo'];
        let { english_names } = (_ as Exclude<typeof _, string>)['complementary'] as { [k: string]: string };
        this.englishNames = createConnection(english_names)
            .on(`open`, () => this.log.success(`Connected to localized names collection.`))
            .model('svt', schema, 'svt');
    }
}