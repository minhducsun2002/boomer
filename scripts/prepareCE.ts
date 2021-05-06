import yargs from 'yargs';
import chalk from 'chalk';
import { mkdirSync, writeFileSync } from 'fs';
import { createConnection } from 'mongoose';
import { encode } from '@msgpack/msgpack';
import { join } from 'path';
import { isMainThread,  workerData, Worker, parentPort } from 'worker_threads';
import { cpus } from 'os';

import { EmbedRenderer } from '../src/lib/fgo';
import { componentLog } from '../src/utils';
import { object, item } from '../src/modules/fgo/complementary-data';
import { initializeMasterModels } from '../src/db/fgo/models';
import { SvtType } from '../src/constants/fgo';
import '../src/globals';

interface WorkerData { threadIndex: number, ceIDs: number[]; };
enum WorkerMessages
{
    EXIT = 1
}

const config = require('../config/test.json');
let { path } = yargs.option('path', { default: '/tmp/pepper_CE', demandOption: true }).argv;
const { masterData: { JP, NA }, complementary: { english_names } } = config.database.fgo;
mkdirSync(path, { recursive: true });

if (isMainThread) mainThread();
else doWorkerWork(workerData);

async function mainThread() {
    const log = new componentLog(`CE details processor | Main thread`);
    const threadCount = Math.min(cpus().length, 4);
    log.info(`Getting CE count...`)

    const connection = createConnection(JP);
    let records = await initializeMasterModels(connection).mstSvt.find({ type: SvtType.SERVANT_EQUIP }).select('id')
        .then(records => { connection.close(); return records.map(svt => svt.id); });

    log.info(`Assigning CE IDs to threads...`)
    let ceIDs = Array(threadCount).fill(0).map(() => [] as number[]);
    for (let [index, id] of records.entries()) ceIDs[index % threadCount].push(id);
    log.info(`Spawning ${threadCount} threads...`)

    let exitedWorkers = 0;
    let workers = [] as Worker[];

    let worker_script_data_key = 'worker_script';
    for (let i = 0 ; i < threadCount ; i++) {
        let worker = new Worker(
            `
            require('ts-node').register({ compiler: 'ttypescript' });
            require(require('worker_threads').workerData.${worker_script_data_key});
            `,
            { eval: true, workerData: { threadIndex: i, ceIDs: ceIDs[i], [worker_script_data_key]: __filename } }
        );
        workers.push(worker);
        worker
            .on('online', () => log.success(`Worker ${i} is up!`))
            .on('message', v => {
                if (`${v}` === `${WorkerMessages.EXIT}`) {
                    log.info(`Worker ${i} requested to exit. Terminating.`);
                    worker.terminate();
                }
                else log.info(`Worker ${i} sent a message : ${v}`);
            })
            .on('exit', () => {
                log.info(`Worker ${i} terminated.`)
                exitedWorkers++;
                if (exitedWorkers >= workers.length) {
                    log.info(`All workers terminated. Stopping the process.`);
                    process.exit();
                }
            })
    }
}

async function doWorkerWork(workerData : WorkerData) {
    const { threadIndex, ceIDs } = workerData
    const log = new componentLog(`CE details processor | Thread ${threadIndex}`);


    const conns = { JP: createConnection(JP), NA: createConnection(NA), comp: createConnection(english_names) };
    const models = { JP: initializeMasterModels(conns.JP), NA: initializeMasterModels(conns.NA) }
    const renderer = new EmbedRenderer(
        models.NA,
        models.JP,
        { svtObject: conns.comp.model('svt', object, 'svt'), item: conns.comp.model('items', item, 'items') }
    );

    for (let id of ceIDs)
        try {
            let embed = await renderer.craftEssenceEmbed(id);
            log.success(`Processed data of CE ${id}.`);
            writeFileSync(join(path, `${id}.pepper.msgpack`), encode(embed));
        } catch (e) {
            log.error(`Error processing CE ${id}.\n${e.stack}`);
        }

    parentPort.postMessage(`${WorkerMessages.EXIT}`);
}