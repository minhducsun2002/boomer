import { Command as c, CommandOptions } from 'discord-akairo';
import type { PepperClient } from './Client';

export const NOT_INITIALIZED = Symbol(
    `This returned from the initialization method implies there was no overrides.`
);

export class PepperCommand extends c {
    client: PepperClient;
    args?: CommandOptions['args'];
    constructor(...args : ConstructorParameters<typeof c>) {
        super(...args);
        this.args = args[1].args;
    }

    initialize() : any {
        return NOT_INITIALIZED;
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