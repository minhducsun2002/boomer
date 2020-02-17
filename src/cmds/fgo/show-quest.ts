import { Message, MessageEmbed } from 'discord.js';
import { FgoCommand } from './baseCommand';
import { constructQuery as c } from '../../lib/fgo/';
import { ERROR_COLOR, SUCCESS_COLOR } from '../../constants/colors';
import { mstQuest } from '../../db/fgo/master/mstQuest';

const commandName = 'show-quests';
const aliases = [commandName, 'quests', 'quest', 'sq']

interface a { q?: string }

export = class extends FgoCommand {
    constructor() {
        super(commandName, {
            aliases, 
            args: [{
                id: 'q',
                match: 'rest'
            }],
            description: 'View information of a quest.'
        })
    }

    private prepare (data: mstQuest) {
        let { id, name, noticeAt, openedAt, closedAt, actConsume, recommendLv, chapterId } = data;
        return new MessageEmbed()
            .setTitle(`${name} (\`${id}\`)`)
            .setDescription(`${actConsume} AP | Recommended level : ${recommendLv}`)
            .addField(
                `Availability`,
                [
                    `\`Notice\`|\`${new Date(noticeAt * 1000).toLocaleString()}\``,
                    `\`Opened\`|\`${new Date(openedAt * 1000).toLocaleString()}\``,
                    `\`Closed\`|\`${new Date(closedAt * 1000).toLocaleString()}\``,
                ].join('\n')
            )
    }

    async exec(m: Message, { q }: a) {
        const err = new MessageEmbed().setColor(ERROR_COLOR)
            .setDescription(`Sorry, couldn't find anything that matched.`)
        let a = +q;
        let [data] = await c.mstQuest(isNaN(a) ? { name: q } : { id: a }).NA.exec();
        m.channel.send('', data ? this.prepare(data) : err)
    }
}