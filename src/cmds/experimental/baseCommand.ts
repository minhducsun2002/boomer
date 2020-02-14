import { deriveBaseCommand } from '../../lib/classes/baseCommand';
import { CommandOptions } from 'discord-akairo';

export default (categoryName: string) => 
    (opt: CommandOptions) =>
        deriveBaseCommand(Object.assign({}, { category: `(Experimental) ${categoryName}` }, opt))