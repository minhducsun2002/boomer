import { FgoModule } from './base';
import { componentLog } from '@pepper/utils';
import mst from './master-data';
import comp from './complementary-data';
import { decode, encode } from '@msgpack/msgpack'
import { EmbedRenderer } from '@pepper/lib/fgo'
import type { MessageEmbed } from 'discord.js';
import { mkdtempSync, writeFileSync, existsSync, readdirSync, readFileSync } from 'fs';
import { tmpdir, cpus } from 'os';
import { join } from 'path';
import c from 'chalk';
import rr from 'rimraf';
import { Queue } from 'queue-ts';
import { SvtType } from '@pepper/constants/fgo';

export = class extends FgoModule {
    require = [new mst().id];
    constructor() {
        super(`skill-details-cache`, {});
    }

    path : string;
    private log = new componentLog(`F/GO skill details`);

    push(s: number, d: any) {
        writeFileSync(this.deriveFilePath(s), encode(d));
        return this;
    }

    private deriveFileName = (s : number) => `${s}.pepper.msgpack`;
    private deriveFilePath = (s : number) => join(this.path, this.deriveFileName(s));

    async get(s: number) {
        let file = this.deriveFilePath(s);
        if (!existsSync(file)) {
            try {
                let rendered = await this.process(s)
                this.push(s, rendered);
                return rendered;
            } catch (e) {
                this.log.error(`Key ${s} is not found in cache & re-render failed!`);
                this.log.error(e.stack);
            }
        }
        else return decode(readFileSync(file)) as MessageEmbed;
    }

    clean() {
        let files = readdirSync(this.path);
        let _ = files.length;
        for (let file of files) rr.sync(join(this.path, file));
        return _;
    }

    private process = (id : number) => {
        let { NA, JP } = this.client.moduleHandler.findInstance(mst);
        let _comp = this.client.moduleHandler.findInstance(comp);
        return new EmbedRenderer(NA, JP, _comp).skillEmbed(id);
    }

    async initialize() {
        let path = mkdtempSync(join(tmpdir(), `pepper_${process.getuid()}_skill_`), "utf-8");
        this.path = path;
        this.log.success(`Setting up cache in ${c.bgBlue.yellowBright(path)}.`);
        let handler = () => { rr.sync(path); process.exit(); }
        process.on('SIGTERM', handler).on('SIGINT', handler);

        let _mst = this.handler.findInstance(mst);
        let _ = await _mst.JP.mstSvt.find({ $or: [{ type: SvtType.NORMAL }, { type: SvtType.HEROINE }] }).select('collectionNo name');
        // delegate this to another function to run in parallel
        let queue = new Queue(cpus().length * 2);

        for (let { collectionNo, name } of _) {
            queue.add(
                async () => {
                    try {
                        let e = await this.process(collectionNo);
                        this.log.success(`Processed skills of servant ${collectionNo}. ${
                            c.bgBlue.yellowBright(name)
                        }`);
                        this.push(collectionNo, e.toJSON());
                    } catch (e) {
                        this.log.error(`Error processing CE ${collectionNo}.\n${e.stack}`)
                    };
                }  
            )
        };
    }
}