import { environmentMode } from '@pepper/constants/configurations';
import { PepperInhibitor } from '@pepper/struct';
export = class extends PepperInhibitor {
    constructor() {
        super('development-filter', {
            reason: 'I am in development mode! Only my owners can invoke commands.',
            type: 'pre',
            category: 'Development'
        })
    }

    exec(m : Parameters<PepperInhibitor['exec']>[0]) {
        if (process.env.NODE_ENV !== environmentMode.production)
            if (!this.client.isOwner(m.author))
                return true;
        return false;
    }
}