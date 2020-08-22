import { AkairoModule } from 'discord-akairo';
import type { PepperClient } from './Client';
import type { ModuleHandler } from './handlers/ModuleHandler';

export class PepperModule extends AkairoModule {
    client: PepperClient;
    async initialize() {};
    async onload() {};
    handler: ModuleHandler;
    require: AkairoModule['id'][] = [];
}