import type { PepperCommand } from '@pepper/struct';
import { extendCommand } from '@pepper/struct';

export const OsuCommand = class extends extendCommand({
    category: 'osu!', typing: true    
}) {
    constructor(...args: ConstructorParameters<typeof PepperCommand>) {
        super(`osu-${args[0]}`, args[1]);
    }

    initialize = () => {
        this.prefix = this.client.config.prefix['osu'];
        return super.initialize()
    }
}