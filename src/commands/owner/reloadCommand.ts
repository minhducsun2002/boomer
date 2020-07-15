import { Message } from 'discord.js';
import { OwnerCommand } from './baseCommand';
import { performance, PerformanceObserver } from 'perf_hooks';
import { Command } from 'discord-akairo';

const commandName = 'reload-cmd'
const aliases = [commandName, 'reload', 'reloadcmd', 'rld-cmd']

export = class extends OwnerCommand {
    constructor() {
        super(commandName, {
            aliases,
            description: 'Reload a(ll) command(s)',
            args: [{
                id: 'cmd',
                type: 'command'
            }]
        })
    }

    async exec(m: Message, { cmd } : { cmd?: Command }) {
        const handler = this.client.commandHandler;
        if (cmd) {
            let out = await m.channel.send(`Reloading \`${cmd.id}\`...`);
            new PerformanceObserver((l, o) => {
                out.edit(`Reloaded \`${cmd.id}\` in \`${l.getEntries()[0].duration / 1000}\`s.`)
                o.disconnect();
            }).observe({ entryTypes: ['function'] });
            performance.timerify(() => handler.reload(cmd.id))()
        } else {
            let out = await m.channel.send(`Reloading all commands...`);
            new PerformanceObserver((l, o) => {
                out.edit(`Reloaded ${handler.modules.size} commands in ${l.getEntries()[0].duration / 1000}s.`)
                o.disconnect();
            }).observe({ entryTypes: ['function'] });
            performance.timerify(() => handler.reloadAll())()
        }
    }
}