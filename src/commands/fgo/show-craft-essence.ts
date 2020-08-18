import { Message, MessageEmbed } from 'discord.js';
import { FgoCommand } from './baseCommand';
import { NA } from '@pepper/db/fgo';
import { ERROR_COLOR, SUCCESS_COLOR } from '../../constants/colors';
import { SvtType } from '../../constants/fgo';
import __ from '../../lib/querifySubstring';

const commandName = 'show-craft-essence';
const aliases = [commandName, 'ce']

export = class extends FgoCommand {
    constructor() {
        super(commandName, {
            aliases, 
            args: [{
                id: 'q',
                match: 'rest'
            }],
            description: 'View information of a Craft Essence.',
            typing: true
        })
    }

    async exec(m: Message, { q } : { q: string }) {
        const err = new MessageEmbed().setColor(ERROR_COLOR)
            .setDescription(
                q
                ? `Sorry, couldn't find anything that matched.`
                : `:frowning: Where's your query?`
            )
        if (!q) return m.channel.send(err);
        const data = await NA.mstSvt.find(
            Object.assign({}, isNaN(+q) ? { name: __(q) as any } : { id: +q }, { type: SvtType.SERVANT_EQUIP })
        ).limit(1).exec();
        if (!data.length) return m.channel.send(err);
        const [{ name, cost, collectionNo, id }] = data;
        const [[{ detail: base }], _] = await Promise.all(
            (await NA.mstSvtSkill.find({ svtId: id }).limit(2).exec())
                .sort((a, b) => a.condLimitCount - b.condLimitCount)
                .map(({ skillId }) => NA.mstSkillDetail.find({ id: skillId }).exec())
        ); 

        const out = new MessageEmbed()
            .setColor(SUCCESS_COLOR)
            .setTitle(`${collectionNo}. ${name} (\`${id}\`)`)
            .setDescription(`Cost : ${cost}`)
            .addField('Base effect', base);
        
        if (_) out.addField(`Maximum limit break effect`, _[0].detail)

        m.channel.send(
            out
        )
    }
}