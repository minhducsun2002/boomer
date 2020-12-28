import { OsuCommand } from './baseCommand';
import { Message, MessageEmbed } from 'discord.js';
import { ERROR_COLOR } from '../../constants/colors'
import { fetchUser, fetchBest } from '@pepper/lib/osu'

import { modes } from '@pepper/constants/osu';

const commandName = 'netgain';
const aliases = [commandName];

export default class extends OsuCommand {
    constructor() {
        super(commandName, {
            aliases,
            description: 'Calculate how much pp an user will gain by setting a score with certain pp amount.',
            args: [{
                id: 'pp',
                description: 'The amount of pp that the user "submits".',
                type: 'number'
            }, {
                id: 'user',
                match: 'rest',
                description: 'Username to get the pp records.'
            }, {
                id: 'mode',
                match: 'option',
                description: `Gamemode to show. Can be ${modes.map(a => '`' + a + '`').join(', ')}.`,
                flag: ['/']
            }]
        })
    }

    async exec(m : Message, { user, mode, pp } = { user: '', mode: '', pp: 0 }) {
        user = user?.trim();
        if (!modes.includes(mode)) mode = modes[0];
        // check mode
        if (!(pp > 0)) pp = 0;
        // check valid pp count
        const err = new MessageEmbed().setColor(ERROR_COLOR)
            .setDescription(`Sorry, couldn't find anyone with username \`${user}\`.`)
        if (!user)
            return m.channel.send(err.setDescription(`Who do you want to search for?`));
        let { user: { username, id, statistics: { pp: _pp } } } = await fetchUser(user, mode);
        let scoresBest = await fetchBest(id, mode, 100, 50);
        let basePP = scoresBest.map(score => score.pp).sort((a, b) => b - a);
        let prev = basePP
            .reduce((sum, pp, exponent) => sum + (pp * Math.pow(0.95, exponent)), 0);
        let next = basePP.concat([pp]).sort((a, b) => b - a)
            .reduce((sum, pp, exponent) => sum + (pp * Math.pow(0.95, exponent)), 0);
        let bonus = _pp - prev, inline = true;
        m.channel.send(
            new MessageEmbed()
                .setTitle(`${username} gains ${(next - prev).toFixed(3)}pp by setting a ${pp}pp record`)
                .setURL(`https://osu.ppy.sh/users/${id}`)
                .addFields([
                    { name: 'Previous total PP', value: `${_pp.toFixed(3)}\n(${prev.toFixed(3)} without bonus)`, inline },
                    { name: 'New total PP', value: `${(next + bonus).toFixed(3)}\n(${next.toFixed(3)} without bonus)`, inline },
                ])
        )
    }
}
