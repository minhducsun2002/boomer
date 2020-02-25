import { createConnection, Connection, Model } from 'mongoose';
import { log } from '../../lib/logger';
import { ship_data_statistics, ship_data_by_type, ship_data_template, gametip,
    ship_data_group
} from './models'

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
    ship_data_statistics: connections.get(locale).model(ship_data_statistics.name, ship_data_statistics.schema, ship_data_statistics.name) as Model<ship_data_statistics.doc>,
    ship_data_by_type: connections.get(locale).model(ship_data_by_type.name, ship_data_by_type.schema, ship_data_by_type.name) as Model<ship_data_by_type.doc>,
    ship_data_template: connections.get(locale).model(ship_data_template.name, ship_data_template.schema, ship_data_template.name) as Model<ship_data_template.doc>,
    gametip: connections.get(locale).model(gametip.name, gametip.schema, gametip.name) as Model<gametip.doc>,
    ship_data_group: connections.get(locale).model(ship_data_group.name, ship_data_group.schema, ship_data_group.name) as Model<ship_data_group.doc>
})

export const models = {
    'en-US': g('en-US'),
    'zh-CN': g('zh-CN'),
}

export type interfaces = {
    ship_data_statistics: ship_data_statistics._interface,
    ship_data_by_type: ship_data_by_type._interface,
    ship_data_template: ship_data_template._interface,
    gametip: gametip._interface,
    ship_data_group: ship_data_group._interface
}