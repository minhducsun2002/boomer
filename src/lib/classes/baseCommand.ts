import { Command, CommandOptions } from 'discord-akairo';

export class BotCommand extends Command {
    constructor(id : string, o: CommandOptions) {
        super(id, o);
        this.args = o.args;
    }

    args: CommandOptions['args']
}

/**
 * Create a {@link Command} subclass that automatically fills in some info
 */
export function deriveBaseCommand(opt: CommandOptions) {
    return class extends BotCommand {
        constructor(id : string, o: CommandOptions) {
            super(id, Object.assign({}, opt, o))
        }
    }
}