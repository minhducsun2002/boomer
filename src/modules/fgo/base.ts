import { PepperModule } from '@pepper/struct';

export const FgoModule = class extends PepperModule {
    constructor(...args: ConstructorParameters<typeof PepperModule>) {
        super(`fgo-${args[0]}`, Object.assign(
            {},
            { category: 'F/GO' },
            args[1],
        ));
    }
}