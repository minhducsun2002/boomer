import { Message, MessageEmbed } from 'discord.js';
import { FgoCommand } from './baseCommand';
import { constructQuery as c } from '../../lib/fgo/';
import { ERROR_COLOR } from '../../constants/colors';

const commandName = 'show-spot';
const aliases = [commandName, 'spot', 'sp']
const MAX_QUEST = 15;

export = class extends FgoCommand {
    constructor() {
        super(commandName, {
            aliases, 
            args: [{
                id: 'q',
                match: 'rest'
            }],
            description: 'View information of a spot.'
        })
    }

    async exec(m: Message, { q }: { q: string }) {
        const err = new MessageEmbed().setColor(ERROR_COLOR)
            .setDescription(`Sorry, couldn't find anything that matched.`)
        if (!q) 
            return m.channel.send(err.setDescription(`:frowning: Where's your query?`))
        try {
            let a = +q;
            let [{ name, id, warId, x, y }] = await c.mstSpot(isNaN(a) ? { name: q } : { id: a }).NA.exec();
            let [{ name: warName }] = await c.mstWar({ id: warId }).NA.select('name').exec();
            let qs = await c.mstQuest({ spotId: id }, MAX_QUEST + 1).NA.select('name id actConsume').exec()
            
            let out = new MessageEmbed()
                .setTitle(`${name} (\`${id}\`)`)
                .addField(`Place`, `**${warName}** | (x, y) = (${x}, ${y})`)
                .addField(
                    `Quests ${qs.length > MAX_QUEST ? `(top ${MAX_QUEST})` : ''}`,
                    qs.slice(0, MAX_QUEST).map(({ name, id, actConsume }) => `\`${id}\` **${name}** (${actConsume}AP)`).join('\n')
                )
            m.channel.send(out)
        }
        catch {
            m.channel.send(err.setDescription('Sorry, an error occurred.'))
        }
    }
}