import { OwnerCommand } from './baseCommand';
import { Message, MessageEmbed, MessageAttachment } from 'discord.js';
import { performance } from 'perf_hooks';
import { inspect } from 'util';
import thenable from 'is-promise';

export = class extends OwnerCommand {
    constructor() {
        super('eval', {
            aliases: ['eval'],
            description: 'Evaluate a JavaScript snippet.',
            args: [{
                id: 'code',
                match: 'restContent',
                type: 'string',
                description: 'Snippet to evaluate.'
            }]
        })
    }

    async exec(m : Message, { code } : { code: string }) {
        if (code === null) code = '';
        var result : any, error = false;
        let start = performance.now();
        try {
            // @eslint-disable-next-line
            let client = this.client, msg = m, channel = m.channel;
            result = eval(code);
            while (thenable(result)) result = await result;
        } catch (e) {
            result = `${e}`; error = true;
        }
        let end = performance.now();
        if (typeof result !== 'string') 
            result = inspect(result, { depth: 3 });
		
        let embed = new MessageEmbed()
            .setDescription('```' + code + '```')
            .addField(`Execution time`, `${((end - start) / 1000).toFixed(6)}s`);
        if (result.length < (1024 - 10))
            embed.addField(error ? `Error` : `Result`, '```' + (result || ' ') + '```');
        else
            embed.attachFiles([new MessageAttachment(Buffer.from(result), 'output.txt')])
        m.channel.send(embed);
    }
}