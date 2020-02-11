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
        console.log(`[${new Date().toJSON()}] ${s}`)
    }
}