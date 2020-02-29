import { deriveBaseCommand } from '../../lib/classes/baseCommand';
import cfg from '../../config';

export const FgoCommand = deriveBaseCommand({ category: 'F/GO', prefix: cfg.get("prefix:fgo")[0] })