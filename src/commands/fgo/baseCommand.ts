import type { PepperCommand } from '@pepper/struct';
import { extendCommand } from '@pepper/struct';

export const FgoCommand = class extends extendCommand({
    category: 'F/GO', typing: true    
}) {
    constructor(...args: ConstructorParameters<typeof PepperCommand>) {
        super(`fgo-${args[0]}`, args[1]);
    }

    initialize = () => {
        this.prefix = this.client.config.prefix['fgo'];
        return super.initialize()
    }
}