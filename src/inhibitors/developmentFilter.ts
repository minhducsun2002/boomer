import { environmentMode } from '@pepper/constants/configurations';
import { Inhibitor } from 'discord-akairo';
export = class extends Inhibitor {
    constructor() {
        super('development-filter-owner', {
            reason: 'I am in development mode! Only my owners can invoke commands.',
            type: 'pre',
            category: 'Development'
        })
    }

    exec(m : Parameters<Inhibitor['exec']>[0]) {
        if (process.env.NODE_ENV !== environmentMode.production)
            if (!this.client.isOwner(m.author))
                return true;
        return false;
    }
}