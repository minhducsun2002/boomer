import { Inhibitor } from 'discord-akairo';
import type { PepperClient } from './Client';

export class PepperInhibitor extends Inhibitor {
    client: PepperClient;
}