import { AkairoModule, Inhibitor } from 'discord-akairo';
import type { PepperClient } from './Client';
import type { InhibitorHandler } from './handlers/InhibitorHandler';

export class PepperInhibitor extends Inhibitor {
    client: PepperClient;
    async initialize() {};
    handler: InhibitorHandler;
    require: AkairoModule['id'][] = [];
}