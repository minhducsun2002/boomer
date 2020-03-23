import { deriveBaseCommand } from '../../lib/classes/baseCommand';
import cfg from '../../config';

let base = deriveBaseCommand({ category: 'osu!', prefix: cfg.get("prefix:osu")[0], typing: true });
type _ = ConstructorParameters<typeof base>;

export const OsuCommand = 
    class extends base {
        constructor(id : _[0], o : _[1]) {
            super(`osu-${id}`, o)
        }
    }