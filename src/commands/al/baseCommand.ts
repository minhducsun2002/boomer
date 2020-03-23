import { deriveBaseCommand } from '../../lib/classes/baseCommand';
import cfg from '../../config';

let base = deriveBaseCommand({ category: 'Azur Lane', prefix: cfg.get("prefix:al")[0], typing: true });
type _ = ConstructorParameters<typeof base>;

export const AlCommand = 
    class extends base {
        constructor(id : _[0], o : _[1]) {
            super(`al-${id}`, o)
        }
    }