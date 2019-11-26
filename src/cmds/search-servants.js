const { Command } = require('discord-akairo');
const { RichEmbed } = require('discord.js');
const fetch = require('node-fetch');

const searchURL = 'https://gamepress.gg/sites/default/files/aggregatedjson/servants-FGO.json';

class Search extends Command {
    constructor() {
        super('search', {
            aliases: ['search-servant', 'ss'],
            args : [{
                id: 'query',
                match: 'content',
                description: 'Search query.'
            }]
        });
    }

    async exec(msg, { query }) {
        const embed = new RichEmbed()
            .setAuthor('Search', 'https://github.com/google/material-design-icons/raw/master/action/1x_web/ic_search_black_24dp.png')
            .setTitle(`Search : \`${query}\``)
            .setDescription('Fetching servants list...');
        await msg.channel.send(embed)
        const db = fetch(searchURL).then(res => res.json());
        await msg.channel.send(embed.setDescription('Parsed servants list. Parsing your query...'));


        // valid id
        const isId = (Number(query) > 0) && (Number(query) < db.length + 2);
        if (isId) {
            await msg.channel.send(embed.setDescription(`Your query seems to be a valid ID, corresponding to **${db.find(
                ({ servant_id }) => servant_id === query
            )}**`))
            return;
        }
        else {
            // search by name
            const results = db.filter
        }
    }
}

module.exports = Search;