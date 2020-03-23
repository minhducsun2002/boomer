import { deriveBaseCommand } from '../../lib/classes/baseCommand';
import cfg from '../../config';

let base = deriveBaseCommand({ category: 'F/GO', prefix: cfg.get("prefix:fgo")[0], typing: true });
type _ = ConstructorParameters<typeof base>;

export const FgoCommand = 
    class extends base {
        constructor(id : _[0], o : _[1]) {
            super(`fgo-${id}`, o)
        }
    }