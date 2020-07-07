import type { mstSvt } from '../../db/fgo/master/mstSvt';
import type { mstClass } from '../../db/fgo/master/mstClass';
import type { mstSvtLimit } from '../../db/fgo/master/mstSvtLimit';
import { MessageEmbed } from 'discord.js';

export function embedServantBase(
    { name, baseSvtId, collectionNo } : mstSvt,
    { name: className } : mstClass,
    limits : mstSvtLimit[]
) {
    return new MessageEmbed()
        .setAuthor(`${
            [...new Set(limits.map(a => a.rarity))].sort((a, b) => a - b).join('-')
        }☆ ${className}`)
        .setTitle(`${collectionNo}. **${name}** (\`${baseSvtId}\`)`)
}