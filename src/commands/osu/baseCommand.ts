import type { PepperCommand } from '@pepper/struct';
import { extendCommand } from '@pepper/struct';
import { client } from '@pepper/client'

export const OsuCommand = class extends extendCommand({
    category: 'osu!', typing: true, prefix: client.config.prefix['osu']
}) {
    constructor(...args: ConstructorParameters<typeof PepperCommand>) {
        super(`osu-${args[0]}`, args[1]);
    }
}