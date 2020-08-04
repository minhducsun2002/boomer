import { AkairoModule } from 'discord-akairo';
import type { PepperClient } from './Client';

export class PepperModule extends AkairoModule {
    client: PepperClient;
    async initialize() {};
    async onload() {};
}