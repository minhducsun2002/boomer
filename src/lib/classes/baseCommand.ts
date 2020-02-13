import { Command, CommandOptions } from 'discord-akairo';

/**
 * Create a {@link Command} subclass that automatically fills in some info
 */
export function deriveBaseCommand(opt: CommandOptions) {
    return class extends Command {
        constructor(id : string, o: CommandOptions) {
            super(id, Object.assign({}, opt, o))
        }
    }
}