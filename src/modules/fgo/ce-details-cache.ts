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
        super(`ce-details-cache`, {});
    }

    path : string;
    private log = new componentLog(`F/GO CE details`);

    push(s: number, d: any) {
        writeFileSync(this.deriveFilePath(s), encode(d));
        return this;
    }

    private deriveFileName = (s : number) => `${s}.pepper.msgpack`;
    private deriveFilePath = (s : number) => join(this.path, this.deriveFileName(s));

    async get(s: number) {
        let file = this.deriveFilePath(s);
        if (!existsSync(file)) {
            // try to get this from DB & parse it
            try {
                // let _ = await this.handler.findInstance(m).get(s);
                // if (!_) throw new Error(`CE with ID ${s} not found!`)
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
        return new EmbedRenderer(NA, JP, _comp).craftEssenceEmbed(id);
    }

    async initialize() {
        let path = mkdtempSync(join(tmpdir(), `pepper_${process.getuid()}_ce_`), "utf-8");
        this.path = path;
        this.log.success(`Setting up cache in ${c.bgBlue.yellowBright(path)}.`);
        let handler = () => { rr.sync(path); process.exit(); }
        process.on('SIGTERM', handler).on('SIGINT', handler);

        let _mst = this.handler.findInstance(mst);
        let _ = await _mst.JP.mstSvt.find({ type: SvtType.SERVANT_EQUIP }).select('id name');
        // delegate this to another function to run in parallel
        let queue = new Queue(cpus().length * 2);

        for (let { id, name } of _) {
            queue.add(
                async () => {
                    try {
                        let e = await this.process(id);
                        this.log.success(`Processed data of CE ${id}. ${
                            c.bgBlue.yellowBright(name)
                        }`);
                        this.push(id, e.toJSON());
                    } catch (e) {
                        this.log.error(`Error processing CE ${id}.\n${e.stack}`)
                    };
                }  
            )
        };
    }
}