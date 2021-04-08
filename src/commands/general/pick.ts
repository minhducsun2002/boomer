import { GeneralCommand } from './baseCommand';
import { Message, MessageEmbed } from 'discord.js'
import axios from 'axios';

const delimiter = '/';

export = class extends GeneralCommand {
    constructor() {
        super('pick', {
            aliases: ['pick'],
            args: [{
                id: 'query',
                match: 'restContent',
                type: 'string',
                description: 'Choices, splitted by commas.'
            }]
        })
    }

    async exec(m : Message, { query } : { query: string }) {
        if (!query)
            return m.channel.send(`You gave me no choice!`);
        let choices = query.split(delimiter).map(_ => _.trim()).filter(Boolean);
        if (choices.length === 1)
            return m.channel.send(`You provided only one choice. You probably don't need me to guess?`);
        let _ = axios.get(
            `https://www.random.org/integers/?num=1&min=1&max=${choices.length}&col=1&base=10&format=plain&rnd=new`,
            { responseType: 'text' }
        )
            .then(r => +r.data);
        return m.channel.send(new MessageEmbed().setTitle(`And my choice is...`).setDescription(choices[await _ - 1]));
    }
}
