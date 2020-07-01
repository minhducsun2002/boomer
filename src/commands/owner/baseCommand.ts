import { extendCommand } from '@pepper/struct';

export const OwnerCommand = extendCommand({ category: 'Reserved', ownerOnly: true })