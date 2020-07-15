import { AkairoClient } from 'discord-akairo';
import { Team } from 'discord.js';
import type { User } from 'discord.js';
// handlers
import { InhibitorHandler } from './handlers/InhibitorHandler';
import { CommandHandler } from './handlers/CommandHandler';
// logger
import { componentLog } from '@pepper/utils';
// utils
import { plural as p } from '@pepper/utils';
import c from 'chalk';
import * as utils from './util';

type cfg = (ConstructorParameters<typeof AkairoClient>[0]); 

type databaseMapping = { [key: string]: string };

interface PepperConfiguration extends cfg {
    commandHandlerOptions?: ConstructorParameters<typeof CommandHandler>[1],
    inhibitorHandlerOptions?: ConstructorParameters<typeof InhibitorHandler>[1],
    config?: {
        /** Whether mentioning the bot directly counts as a prefix */
        pingAsPrefix?: boolean;
        /** Prefixes for commands */
        prefix?: { [key: string]: string[] };
        database?: { [key: string]: databaseMapping | string };
    }
}

export class PepperClient extends AkairoClient {
    private clientLog = new componentLog(`Client`, '#00fff7', '#000');
    config: PepperConfiguration['config']
    commandHandler : CommandHandler;
    extras = utils;

    constructor(cfg : PepperConfiguration = {
        ownerID: [],
        commandHandlerOptions: {},
        inhibitorHandlerOptions: {},
        config: {}
    }) {
        super(cfg);
        if (!cfg.ownerID || cfg.ownerID.length === 0)
            this.once('ready', async () => {
                this.clientLog.warning(
                    `No owner ID was provided.\nI'll attempt to fetch this from the application profile.`
                );
                await this.fetchApplication()
                    .then(_ => {
                        let o : User[] = [];
                        if (_.owner instanceof Team) {
                            // for teams,
                            // all members are owners
                            let m = _.owner.members.array();
                            this.ownerID = m.map(a => a.id);
                            o = m.map(a => a.user);
                        }
                        else {
                            this.ownerID = [_.owner.id];
                            o = [_.owner];
                        }
                        return o;
                    })
                    .then(_ => this.clientLog.success(
                        `Successfully fetched application profile.`
                        + `\nLooks like I belong to ${_.length > 1 ? 'a team' : 'an user'}.`
                        + `\nI recognize the following user${p(_.length)} as my owner${p(_.length)} :`
                        + `\n`
                        + _.map(
                            a => ` * ${c.bgGreenBright.red(a.id)} `
                                + c.green(`=>`)
                                + ` ${c.bgMagentaBright.black(a.tag)}`
                        ).join('\n')
                    ))
            })

        this.once('ready', () => {
            let g = this.guilds.cache;
            this.clientLog.success(
                `I am now logged in as ${c.bgBlue.yellowBright(this.user.tag)} (${
                    this.user.id
                }).`
                + `\nI will be serving in ${g.size} guild${p(g.size)} :`
                + `\n`
                + g.array().map(
                    a => ` * ${c.bgCyanBright.black(a.id)} `
                        + c.green(`=>`)
                        + ` ${c.bgYellowBright.black(a.name)}`
                ).join('\n')
            )
        })

        let pre = cfg.config.prefix || {};
        this.commandHandler = new CommandHandler(
            this,
            Object.assign(
                {},
                { prefix: Object.keys(pre).map(a => pre[a]).flat() },
                cfg.commandHandlerOptions   
            )
        );
        this.config = cfg.config;
    }
}