import chalk from 'chalk';

export class log {
    static error(s: string) {
        log.log(chalk.bgRed('[Error]') + ` ${s}`)
    }

    static warning(s: string) {
        log.log(chalk.bgYellow('[Warning]') + ` ${s}`)
    }

    static info(s: string) {
        log.log(chalk.bgBlue('[Info]') + ` ${s}`)
    }

    static success(s: string) {
        log.log(chalk.bgGreenBright.black('[Success]') + ` ${s}`)
    }

    private static log(s: string) {
        let _ = s.split('\n'), d = `[${new Date().toJSON()}]`; 
        console.log(`${d} | ${_[0]}`);
        _.slice(1).forEach(a => console.log(`${' '.repeat(d.length)} | ${a}`))
    }
}