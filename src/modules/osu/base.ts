import { PepperModule } from '@pepper/struct';

export const OsuModule = class extends PepperModule {
    constructor(...args: ConstructorParameters<typeof PepperModule>) {
        super(`osu-${args[0]}`, Object.assign(
            {},
            { category: 'osu!' },
            args[1],
        ));
    }
}