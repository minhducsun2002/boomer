
import { MessageEmbed, Message } from 'discord.js';
import { GeneralCommand } from './baseCommand';
import { Octokit } from '@octokit/rest';

const { npm_package_repository_url, npm_package_version, botName } = process.env

const client = new Octokit({
    userAgent: `${botName || 'Boomer'} v${npm_package_version}`
});

const commandName = 'changelog';
const aliases = [commandName, 'changes'];

const max = 10;

export = class extends GeneralCommand {
    constructor() {
        super(commandName, {
            aliases,
            typing: true,
            description: `Show ${max} latest commits from GitHub`
        })
    }

    async exec(m : Message) {
        const [repo, owner] = npm_package_repository_url.split('/').filter(a=>a).reverse()
        const { data } = await client.repos.listCommits({
            repo: repo.replace('.git', ''), owner, per_page: max
        })

      
        const out = new MessageEmbed()
            .setTitle(`Latest ${data.length} commit(s) from \`${owner}/${repo}\``)
            .setURL(`https://github.com/${owner}/${repo}`)
            .setDescription(
                data.map(({ html_url, sha, commit: { message }, committer: { login, html_url: c_url } }) => {
                    message = message.split('\n').filter(a=>a)[0];
                    message = message.length > 55 ? message.slice(0, 55) + '...' : message;
                    return (
                        `[\`${sha.slice(0, 7)}\`](${html_url})|[\`${login}\`](${c_url}) ${message}`
                    )
                }).join('\n')
            )
        

        m.channel.send(out)
    }
}