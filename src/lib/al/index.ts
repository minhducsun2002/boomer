import ship_data_statistics = require('./ship_data_statistics')
import ship_data_by_type = require('./ship_data_by_type')
import ship_data_template = require('./ship_data_template');
import gametip = require('./gametip');
import ship_data_group = require('./ship_data_group');
export {
    ship_data_statistics, ship_data_by_type, ship_data_template, gametip, ship_data_group
}

export type interfaces = {
    ship_data_statistics: ship_data_statistics._interface,
    ship_data_by_type: ship_data_by_type._interface,
    ship_data_template: ship_data_template._interface,
    gametip: gametip._interface,
    ship_data_group: ship_data_group._interface
}