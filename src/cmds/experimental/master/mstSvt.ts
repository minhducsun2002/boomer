import { Message, MessageEmbed } from 'discord.js'
import { FgoCommand } from './baseCommand';
import { constructQuery, mstSvt } from '../../../lib/experimental/search';
import { ERROR_COLOR, SUCCESS_COLOR } from '../../../constants/colors'

const commandName = 'mstSvt', aliases = [commandName]

export = class extends FgoCommand {
    constructor() {
        super(commandName, {
            aliases,
            typing: true,
            description: 'Query for data in `mstSvt` data set.',
            args: [{
                id: 'collectionNo',
                match: 'option',
                description: 'Collection number',
                flag: ['-c=', '/c:'],
                type: 'number'
            }, {
                id: 'id',
                match: 'phrase',
                description: 'Internal ID',
                type: 'number'
            }]
        })
    }

    async exec(m : Message, { collectionNo, id } : Partial<mstSvt>) {
        if (!collectionNo && !id) 
            return m.channel.send(
                '',
                new MessageEmbed().setColor(ERROR_COLOR)
                    .setDescription(':frowning: Where is your query?')
            )
        const { JP, NA } = constructQuery({ collectionNo, id }, 1);
        const results = { JP: (await JP.exec())[0], NA: (await NA.exec())[0] };

        if (!results.JP) return m.channel.send(
            '',
            new MessageEmbed().setColor(ERROR_COLOR)
                .setDescription(':frowning: Sorry, I found nothing.')
        )

        const {
            name, ruby, battleName, 
            id: _id, baseSvtId, collectionNo: _cNo,
            sellMana, sellQp, sellRarePri,
            genderType, relateQuestIds
        } = results.JP

        const out = new MessageEmbed()
            .setColor(SUCCESS_COLOR)
            .setTitle(`\`mstSvt\` entry for object ID ${_id}\n(collection number \`${_cNo}\`)`)
            .addField('Name', `${results.NA.name}\n${name}\n- (${ruby})`)
            .addField('Name in battle', `${battleName} / ${results.NA.battleName}`)
            .addField('ID / Base ID', `${_id} / ${baseSvtId}`)
            .addField('(Mana/Rare) Prisms/QP pay', `${sellMana} / ${sellRarePri} / ${sellQp}`)
            .addField('Gender', `${genderType}`, true)
            .addField('Related quests', relateQuestIds.join(', ') || 'None')
        
        m.channel.send(out)
    }
}