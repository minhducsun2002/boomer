import yargs from 'yargs';
import chalk from 'chalk';
import { mkdirSync, writeFileSync } from 'fs';
import { createConnection } from 'mongoose';
import { encode } from '@msgpack/msgpack';
import { join } from 'path';

import { EmbedRenderer } from '../src/lib/fgo';
import { componentLog } from '../src/utils';
import { object, item } from '../src/modules/fgo/complementary-data';
import { initializeMasterModels } from '../src/db/fgo/models'
import { SvtType } from '../src/constants/fgo';
const config = require('../config/test.json');

import '../src/globals';

const log = new componentLog(`CE details processor`);
const { path } = yargs
    .option('path', {
        default: '/tmp/pepper_CE',
        demandOption: true
    })
    .argv;

mkdirSync(path, { recursive: true });
// connect
const { masterData: { JP, NA }, complementary: { english_names } } = config.database.fgo;
const conns = { JP: createConnection(JP), NA: createConnection(NA), comp: createConnection(english_names) };
const models = { JP: initializeMasterModels(conns.JP), NA: initializeMasterModels(conns.NA) }
const renderer = new EmbedRenderer(
    models.NA,
    models.JP,
    { svtObject: conns.comp.model('svt', object, 'svt'), item: conns.comp.model('items', item, 'items') }
);

models.JP.mstSvt.find({ type: SvtType.SERVANT_EQUIP }).select('id name')
    .exec()
    .then(async _ => {
        let count = 0;
        log.info(`Found ${_.length} Craft Essences.`);
        for (let { id, name } of _)
            try {
                let embed = await renderer.craftEssenceEmbed(id);
                let indexString = `[${`${count++}`.padStart(`${_.length}`.length, '0')}/${_.length}]`;
                log.success(`${indexString} Processed data of CE ${id}. ${chalk.bgBlue.yellowBright(name)}`);
                writeFileSync(join(path, `${id}.pepper.msgpack`), encode(embed));
            } catch (e) {
                log.error(`Error processing CE ${id}.\n${e.stack}`)
            };
        process.exit();
    })