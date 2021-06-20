import { componentLog } from '@pepper/utils';
import { OsuModule } from "./base";
import { createConnection, Document, Model, Schema } from 'mongoose';
import Cache from '@akashbabu/lfu-cache';

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
    private cache = new Cache<string>({
        max: 100,
        evictCount: 5
    })

    async setUser(userId : string, username: string) {
        return await this.model.findOneAndUpdate(
            { discordUserId: userId.trim() },
            { osuUsername: username.trim(), discordUserId: userId.trim() },
            { upsert: true, new: true }
        ).exec().then(record => {
            this.cache.delete(record.discordUserId);
            this.cache.set(record.discordUserId, record.osuUsername);
            return record;
        });
    }
    async unsetUser(userId : string) {
        return await this.model.findOneAndDelete({ discordUserId: userId.trim() })
            .exec().then(record => {
                this.cache.delete(record.discordUserId);
                return record;
            });
    }
    async getUser(userId : string) {
        userId = userId.trim();
        return this.cache.peek(userId)
            ? { discordUserId: userId, osuUsername: this.cache.get(userId) }
            : await this.model.findOne({ discordUserId: userId.trim() }).exec().then(record => {
                if (!record) return null;
                this.cache.delete(record.discordUserId);
                this.cache.set(record.discordUserId, record.osuUsername);
                return record;
            })
    }
    async listUsers(...userIds : string[]) {
        if (!userIds.length)
            throw new Error('No user ID was specified!');
        let cached = userIds.map(uid => this.cache.peek(uid) ? { discordUserId: uid, osuUsername: this.cache.get(uid) } :  '').filter(Boolean);
        let requesting = userIds.filter(uid => !this.cache.peek(uid));
        return await this.model.find({ $or: requesting.map(id => ({ discordUserId: id.trim() })) })
            .exec().then(records => {
                for (let { discordUserId, osuUsername } of records) {
                    this.cache.delete(discordUserId);
                    this.cache.set(discordUserId, osuUsername);
                }
                return [...records, ...cached] as UsernameRecord[];
            });
    }

    async initialize() {
        let { osu } = this.client.config.database;
        let { username } = osu as Exclude<typeof osu, string>;

        this.model = createConnection(`${username}`)
            .on('open', () => this.log.success(`Connected to osu! username database.`))
            .model('username', new Schema({ osuUsername: String, discordUserId: String }), 'username');
    }
}