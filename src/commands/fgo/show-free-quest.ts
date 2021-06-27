import { Message, MessageEmbed } from 'discord.js';
import { FgoCommand } from './baseCommand';
import { ERROR_COLOR } from '@pepper/constants/colors';
import { paginatedEmbed } from '@pepper/utils';
import { Trait } from '@pepper/constants/fgo/strings';
import freeQuestNA from '@pepper/modules/fgo/free-quest-name-search-NA';
import masterData from '@pepper/modules/fgo/master-data';
import rayshift_io from '@pepper/modules/fgo/rayshift-io';

export = class extends FgoCommand {
    constructor() {
        super('show-free-quest', {
            aliases: ['show-free-quest', 'sfq', 'ssq', 'q', 'sq'],
            description: 'Show information about a free quest.',
            args: [{
                id: 'query',
                match: 'rest',
                description: 'Search query'
            }]
        })
    }

    async exec(m : Message, { query } : { query: string }) {
        const bail = () => m.channel.send(
            new MessageEmbed().setColor(ERROR_COLOR)
                .setDescription(
                    query
                    ? `I found no matching results. :frowning:`
                    : `:frowning: Where's your query?`
                )
        );
        if (!query) return bail();

        let freeQuest = await this.resolveModule(freeQuestNA).search(query);
        if (!freeQuest.length) return bail();

        let { item: { spot, spotName, name, quest } } = freeQuest[0];
        let war = await this.resolveModule(masterData).NA.mstWar.findOne({ id: spot.warId }).exec();
        let rayshiftio = this.resolveModule(rayshift_io);
        let phases = await this.resolveModule(masterData).NA.mstQuestPhase.find({ questId: quest.id }).exec()
            .then(phases => phases.sort((phase1, phase2) => phase1.phase - phase2.phase))

        let spotIconPrefix = `${spot.warId}`.padStart(4, '0');

        let baseEmbed = () => new MessageEmbed()
            .setAuthor(
                `${war.name} > ${spotName}`,
                `https://assets.atlasacademy.io/GameData/NA/Terminal/QuestMap/Capter${spotIconPrefix}/QMap_Cap${spotIconPrefix}_Atlas/spot_${spot.id.toString().padStart(6, '0')}.png`,
                `https://apps.atlasacademy.io/db/NA/war/${war.id}`
            )
            .setTitle(`\`${quest.id}\` ${name}`)
            .setURL(`https://apps.atlasacademy.io/db/NA/quest/${quest.id}/1`)
            .setFooter(`AP : ${quest.actConsume}`);

        let data = await Promise.allSettled(
            phases.map(phase => rayshiftio.query(2, quest.id, phase.phase))
        )
            .then(response => response.filter(response => response.status === 'fulfilled'))
            .then(response => response.map(response => (response as Exclude<typeof response, PromiseRejectedResult>).value))
            .then(_ => _.slice(0, 1)?.[0].questDetails)
            .then(details => Object.values(details)[0]);

        let userSvt = new Map(data.userSvt.map(svt => [svt.id, svt]));
        let out = data.enemyDeck
            .map((stage, index) => {
                let embed = baseEmbed()
                    .addFields(stage.svts
                        .sort((svt1, svt2) => {
                            let [userSvtDetails1, userSvtDetails2] = [svt1, svt2].map(svt => userSvt.get(svt.userSvtId));
                            return userSvtDetails1.id - userSvtDetails2.id;
                        })
                        .map(svt => {
                            let { hp, atk, deathRate, criticalRate, chargeTurn, individuality } = userSvt.get(svt.userSvtId);
                            let traits = individuality.map(indv => Trait[indv as keyof typeof Trait] || indv).join(', ');
                            return {
                                name: `${svt.id}. ${svt.name}`,
                                value: [
                                    `HP : **${hp}** • ATK : **${atk}**`,
                                    `Death rate : ${deathRate / 10}% • Critical rate : ${criticalRate}%`,
                                    `Charge count : ${chargeTurn}`,
                                    `Trait : ${traits}`
                                ].join('\n')
                            }
                        })
                    );
                return embed.setFooter(`${embed.footer.text}  •  Wave ${index + 1}`)
            })

        return paginatedEmbed()
            .setChannel(m.channel)
            .setEmbeds(out)
            .run({ idle: 20000, dispose: true })
    }
}