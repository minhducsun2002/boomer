import { PepperInhibitor } from '@pepper/struct';
import type { PepperCommand } from '@pepper/struct';
import { MultiMap } from 'mnemonist';
import { createConnection, Document, Model, Schema } from 'mongoose';
import { componentLog } from '@pepper/utils';

interface WhitelistRecord extends Document { commandId: string, guildId: string };

export = class extends PepperInhibitor {
    constructor() {
        super('command-enablement', {
            reason: 'This command is not callable from this server.\nContact my owner(s) for more details',
            type: 'post',
            category: 'Command'
        })
    }

    public mongooseModel: Model<WhitelistRecord, {}>;
    // commandId => guildId
    public records: MultiMap<string, string, Set<string>> = new MultiMap<string, string>(Set);
    private log = new componentLog('Command execution whitelisting');

    async addWhitelist(commandId: string, guildId: string) {
        await this.mongooseModel.findOneAndUpdate({ commandId, guildId }, { commandId, guildId }, { upsert: true });
        this.records.set(commandId, guildId);
        return true;
    }

    async removeWhitelist(commandId: string, guildId: string) {
        await this.mongooseModel.findOneAndRemove({ commandId, guildId });
        return !!this.records.get(commandId)?.delete(guildId);
    }

    async load() {
        let _ = new MultiMap<string, string>(Set);
        for (let record of await this.mongooseModel.find({}))
            _.set(record.commandId, record.guildId);
        this.records = _;
    }

    async initialize() {
        let { command } = this.client.config.database;
        let { whitelist } = command as Exclude<typeof command, string>;

        this.mongooseModel = createConnection(`${whitelist}`)
            .on('open', () => this.log.success(`Connected to command whitelist.`))
            .model<WhitelistRecord>('commands', new Schema({ commandId: String, guildId: String }));
        await this.load();
    }

    exec(m: Parameters<PepperInhibitor['exec']>[0], c: PepperCommand) {
        if (c.locked) {
            if (this.records.get(c.id)?.has(m.guild.id)) return false;
            return true;
        }
        return false;
    }
}