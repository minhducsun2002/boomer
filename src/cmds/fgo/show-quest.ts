import { Message, MessageEmbed } from 'discord.js';
import { FgoCommand } from './baseCommand';
import { constructQuery as c } from '../../lib/fgo/';
import { ERROR_COLOR, SUCCESS_COLOR } from '../../constants/colors';
import { mstQuest } from '../../db/fgo/master/mstQuest';

const commandName = 'show-quests';
const aliases = [commandName, 'quests', 'quest', 'sq', 'q']

interface a { q?: string }

export = class extends FgoCommand {
    constructor() {
        super(commandName, {
            aliases, 
            args: [{
                id: 'q',
                match: 'rest'
            }],
            description: 'View information of a quest.',
            typing: true
        })
    }

    private async prepare (data: mstQuest) {
        let { id, name, noticeAt, openedAt, closedAt, actConsume, recommendLv, spotId } = data;
        let [spot] = await c.mstSpot({ id: spotId }).NA.select('name warId').exec();
        let [war] = spot ? await c.mstWar({ id: spot.warId }).NA.select('name').exec() : [null];
        let [consume] = await c.mstQuestConsumeItem({ questId: id }).NA.exec();
        console.log(await c.mstQuestConsumeItem({ questId: id }).NA.exec())
        let items = consume 
            ? (await Promise.all(consume.itemIds.map(id => {
                let _ = c.mstItem({ id }).NA;
                return ((_ as any).cache() as typeof _).select('name id').limit(1).exec()
            }))).map(([a]) => a)
            : [];
        let out =  new MessageEmbed()
            .setColor(SUCCESS_COLOR)
            .setTitle(`${name} (\`${id}\`)`)
            .setDescription(`${actConsume} AP | Recommended level : ${recommendLv}`)
            .addField(
                'Place',
                spot 
                ? `**${war.name}** | ${spot.name}`
                : 'N/A'
            )
            .addField(
                `Availability`,
                [
                    `\`Notice\`|\`${new Date(noticeAt * 1000).toLocaleString()}\``,
                    `\`Opened\`|\`${new Date(openedAt * 1000).toLocaleString()}\``,
                    `\`Closed\`|\`${new Date(closedAt * 1000).toLocaleString()}\``,
                ].join('\n')
            )

        if (items.length) out.addField(
            'Consumed items',
            consume.nums.map((count, i) => `- ${count} × **${items[i].name}** (\`${items[i].id}\`)`).join('\n')
        )
        
        return out;
    }

    async exec(m: Message, { q }: a) {
        const err = new MessageEmbed().setColor(ERROR_COLOR)
            .setDescription(`Sorry, couldn't find anything that matched.`)
        let a = +q;
        let [data] = await c.mstQuest(isNaN(a) ? { name: q } : { id: a }).NA.exec();
        m.channel.send('', data ? (await this.prepare(data)) : err)
    }
}