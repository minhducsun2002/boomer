import type { PepperCommand } from '@pepper/struct';
import { extendCommand } from '@pepper/struct';
import { client } from '@pepper/client';

export const FgoCommand = class extends extendCommand({
    category: 'F/GO', typing: true, prefix: client.config.prefix['fgo']
}) {
    constructor(...args: ConstructorParameters<typeof PepperCommand>) {
        super(`fgo-${args[0]}`, args[1]);
    }   
}