import { deriveBaseCommand } from '../../lib/classes/baseCommand';
import cfg from '../../config';

export const AlCommand = deriveBaseCommand({ category: 'Azur Lane', prefix: cfg.get("prefix:al")[0] })