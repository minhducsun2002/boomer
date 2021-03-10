import { Command as c, CommandOptions } from 'discord-akairo';
import type { PepperClient } from './Client';
import { CommandHandler } from './handlers/CommandHandler';

export interface PepperCommandOptions extends CommandOptions
{
    /**
     * Whether this command requires manual guild whitelisting to run
     */
    locked?: boolean;
}

export class PepperCommand extends c {
    client: PepperClient;
    args?: CommandOptions['args'];
    handler: CommandHandler;
    /**
     * Whether this command requires manual guild whitelisting to run
     */
    locked: boolean;
    constructor(id : string, options? : PepperCommandOptions) {
        super(id, options);
        this.args = options.args;
        this.locked = !!options.locked;
    }

}

/**
 * Extend the base class to fill in some options
 * @param o Command options to fill in automatically
 */
export function extendCommand(opt : CommandOptions) {
    return class extends PepperCommand {
        constructor(id : string, o: CommandOptions) {
            super(id, Object.assign({}, opt, o))
        }
    }
}