import { PepperClient } from './struct';
import { config } from 'dotenv'; config();
import { join } from 'path';

const client = new PepperClient({
    commandHandlerOptions: {
        blockBots: false,
        allowMention: true,
        directory: join(__dirname, 'commands')
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
    .loadAll();
client.inhibitorHandler.loadAll();
client.moduleHandler.loadAll();

// initialize all modules
Promise.all(
    client.moduleHandler.modules.array()
        .map(m => m.initialize())
).then(() => client.login(process.env.DISCORD_TOKEN))
export { client };
