import './globals';
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
                .addField('Reason', rr[r as keyof typeof rr]())
        )
    })
    .on('error', (e, m, c) => {
        if (!c) return;
        m.reply(client.extras.Embeds.COMMAND_ERROR(`${e}`, c as any));
    })
    .loadAll();
client.inhibitorHandler.loadAll();
// initialize all modules
client.moduleHandler.loadAll()
    .initializeAll()
    .then(succeeded => {
        if (succeeded) client.login(process.env.DISCORD_TOKEN);
        else process.exit(1);
    })
export { client };
