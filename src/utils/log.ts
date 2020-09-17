import chalk from 'chalk';
import * as c from 'console';
import ss from 'strip-ansi';
import { environmentMode } from '@pepper/constants/configurations'

type str = string;
const Prefixes = {
    Error: chalk.bgRed('[✕]'),
    Warning: chalk.bgYellow('[!]'),
    Info: chalk.bgBlue('[i]'),
    Success: chalk.bgGreenBright.black('[✓]')
}

const gen = (ss: str) => (s: str, _ = '') => log.log(s, ss + _)
const log = {
    error : gen(Prefixes.Error),
    warning : gen(Prefixes.Warning),
    info : gen(Prefixes.Info),
    success : gen(Prefixes.Success),

    log : (s: str, p : str) => {
        if (process.env.NODE_ENV === environmentMode.testing) return;
        let _ = `${s}`.split('\n'), d = `${new Date().toJSON()}`; 
        c.log(`${chalk.magentaBright(d)}| ${p} ${_[0]}`);
        _.slice(1).forEach(a => c.log(`${' '.repeat(d.length)}| ${
            ' '.repeat(ss(p).length)
        } ${a}`))
    }
}

export class componentLog {
    private p = '';
    constructor(s : str, bg = '#ffffff', fg = '#000000') {
        this.p = ' ' + chalk.bgHex(bg).hex(fg)(`[${s}]`);
    }

    error = (s : str) => log.error(s, this.p)
    warning = (s : str) => log.warning(s, this.p)
    info = (s : str) => log.info(s, this.p)
    success = (s : str) => log.success(s, this.p)
}