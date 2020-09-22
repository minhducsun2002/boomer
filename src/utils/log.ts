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

/** Generate a logging function to prefix logs with a certain string */
function gen (ss: str) {
    return (s: str, _ = '') => log.log(s, ss + _)
}

const log = {
    error : gen(Prefixes.Error),
    warning : gen(Prefixes.Warning),
    info : gen(Prefixes.Info),
    success : gen(Prefixes.Success),

    log : (log: str, prefix : str) => {
        if (process.env.NODE_ENV === environmentMode.testing) return;
        let _ = `${log}`.split('\n'), d = `${new Date().toJSON()}`; 
        c.log(`${chalk.magentaBright(d)}| ${prefix} ${_[0]}`);
        _.slice(1).forEach(a => c.log(`${' '.repeat(d.length)}| ${
            ' '.repeat(ss(prefix).length)
        } ${a}`))
    }
}

/**
 * Simple class to categorize log messages.
 */
export class componentLog {
    private p = '';
    /**
     * @param tag "Tag" of the log. Will be printed after log category, but before log message
     * @param bg Background colour of the tag text
     * @param fg Foreground colour of the tag text
     */
    constructor(tag : str, bg = '#ffffff', fg = '#000000') {
        this.p = ' ' + chalk.bgHex(bg).hex(fg)(`[${tag}]`);
    }

    error = (s : str) => log.error(s, this.p)
    warning = (s : str) => log.warning(s, this.p)
    info = (s : str) => log.info(s, this.p)
    success = (s : str) => log.success(s, this.p)
}