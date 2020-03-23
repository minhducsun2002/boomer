import { deriveBaseCommand } from '../../lib/classes/baseCommand';
import cfg from '../../config';

export const OsuCommand = deriveBaseCommand({ category: 'osu!', prefix: cfg.get("prefix:osu")[0], typing: true })