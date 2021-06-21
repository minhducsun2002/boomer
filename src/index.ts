import './globals';
import { WebhookClient, MessageEmbed } from 'discord.js';
import { PepperClient } from './struct';
import { join } from 'path';

const client = new PepperClient({
    commandHandlerOptions: {
        blockBots: false,
        allowMention: true,
        directory: join(__dirname, 'commands'),
        commandUtil: true
    },
    inhibitorHandlerOptions: {
        directory: join(__dirname, 'inhibitors')
    },
    moduleHandlerOptions: {
        directory: join(__dirname, 'modules')
    },
    config: require(
        join(
            process.cwd(),
            'config',
            (process.env.NODE_ENV ?? 'development') + '.json'
        )
    )
});
client.commandHandler
    .on('commandBlocked', async (m, {}, r) => {
        let h = client.commandHandler, rr = client.extras.CommandBlockReason;
        let _ = await h.parseCommand(m) || await h.parseCommandOverwrittenPrefixes(m);
        m.channel.send(
            client.extras.Embeds.PERMISSION_DENIED(m.author)
                .addField(
                    'Command',
                    `Prefix : \`${_.prefix}\`\nAlias : \`${_.alias}\``,
                    true
                )
                .addField('Reason', rr[r as keyof typeof rr]?.() || r)
        )
    })
    .on('error', (e, m, c) => {
        if (!c) return;
        m.reply(client.extras.Embeds.COMMAND_ERROR(`${e}`, c as any));
    })
    .loadAll();

Promise.all([client.inhibitorHandler, client.moduleHandler].map(_ => _.loadAll().initializeAll()))
    .then(succeeded => {
        if (succeeded.every(a => a))
            client.login(process.env.DISCORD_TOKEN)
        else process.exit(1)
    })

// error reporting service
const [token, id] = client.config["error-reporting"]?.["discord-webhook"]?.split('/').reverse() || [];
if (token && id) {
    let webhookClient = new WebhookClient(id, token);
    process.on(
        'uncaughtException',
        error => {
            let { stack, message, name } = error;
            let stackLines = stack.split('\n'), outputtedLines : string[] = [], length = 0;
            for (let line of stackLines)
                if (length + line.length + 1 <= 1000) {
                    outputtedLines.push(line);
                    length += line.length + 1;
                }

            webhookClient.send(
                new MessageEmbed()
                    .setTitle(`An uncaught exception of type \`${name}\` has occurred.`)
                    .setDescription('```' + message + '```')
                    .addField(
                        'Stack',
                        [
                            '```',
                            outputtedLines.join('\n'),
                            (outputtedLines.length !== stackLines.length ? '(truncated)' : ''),
                            '```'
                        ].filter(Boolean).join('\n')
                    ),
                    {
                        files: (outputtedLines.length !== stackLines.length)
                            ? [{
                                name: 'error.txt',
                                attachment: Buffer.from(stack, 'utf-8')
                            }]
                            : []
                    }
            )
                .then(() => console.error(error))
                .then(() => process.exit(1));
        }
    )
}

export { client };
