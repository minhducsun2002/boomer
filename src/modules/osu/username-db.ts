import { componentLog } from '@pepper/utils';
import { OsuModule } from "./base";
import { createConnection, Document, Model, Schema } from 'mongoose';

interface UsernameRecord extends Document {
    osuUsername: string;
    discordUserId: string;
}

export = class extends OsuModule {
    private log = new componentLog('osu! username database');

    constructor() {
        super(`username-db`);
    }

    private model : Model<UsernameRecord, {}>;

    async setUser(userId : string, username: string) {
        return await this.model.findOneAndUpdate(
            { discordUserId: userId.trim() },
            { osuUsername: username.trim(), disordUserId: userId.trim() },
            { upsert: true }
        );
    }
    async unsetUser(userId : string) {
        return await this.model.findOneAndDelete({ discordUserId: userId.trim() });
    }
    async getUser(userId : string) {
        return await this.model.findOne({ discordUserId: userId.trim() });
    }
    async listUsers(...userIds : string[]) {
        if (!userIds.length)
            throw new Error('No user ID was specified!')
        return await this.model.find({ $or: userIds.map(id => ({ discordUserId: id.trim() })) });
    }

    async initialize() {
        let { osu } = this.client.config.database;
        let { username } = osu as Exclude<typeof osu, string>;

        this.model = createConnection(`${username}`)
            .on('open', () => this.log.success(`Connected to osu! username database.`))
            .model('username', new Schema({ osuUsername: String, discordUserId: String }), 'username');
    }
}