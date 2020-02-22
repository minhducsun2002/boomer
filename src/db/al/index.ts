import { createConnection, Connection, Model } from 'mongoose';
import { log } from '../../lib/logger';
import { ship_data_statistics } from './models'

import cfg from '../../config';

const _ = (s: string) => `[AL] ${s}`;

const prefix = 'database:al', locales = ['en-US', 'zh-CN']
export const connections = new Map<string, Connection>();

locales.forEach(locale => {
    connections
        .set(
            locale,
            createConnection(cfg.get(`${prefix}:${locale}`))
                .on('open', () => log.success(_(`Successfully connected to ${locale} database`)))
        )
});

const g = (locale: string) => ({
    ship_data_statistics: connections.get(locale).model(ship_data_statistics.name, ship_data_statistics.schema, ship_data_statistics.name) as Model<ship_data_statistics.doc>   
})

export const models = {
    'en-US': g('en-US'),
    'zh-CN': g('zh-CN'),
}

export type interfaces = {
    ship_data_statistics: ship_data_statistics._interface
}