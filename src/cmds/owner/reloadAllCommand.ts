import { MessageEmbed, Message } from 'discord.js';
import { OwnerCommand } from './baseCommand';
import { performance, PerformanceObserver } from 'perf_hooks';
import { Command } from 'discord-akairo';
import Bot from '../../';

const commandName = 'reload-cmd'
const aliases = [commandName, 'reload', 'reloadcmd', 'rld-cmd']

interface arg { cmd?: Command }

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

    async exec(m: Message, { cmd } : arg) {
        const handler = (this.client as Bot).cmdHandler;
        if (cmd) {
            let out = await m.channel.send(`Reloading \`${cmd.id}\`...`);
            new PerformanceObserver((l, o) => {
                out.edit(`Reloaded \`${cmd.id}\` in \`${l.getEntries()[0].duration}\`s.`)
                o.disconnect();
            }).observe({ entryTypes: ['function'] });
            performance.timerify(() => handler.reload(cmd.id))()
        } else {
            let out = await m.channel.send(`Reloading all commands...`);
            new PerformanceObserver((l, o) => {
                out.edit(`Reloaded ${handler.modules.size} commands in \`${l.getEntries()[0].duration}\`s.`)
                o.disconnect();
            }).observe({ entryTypes: ['function'] });
            performance.timerify(() => handler.reloadAll())()
        }
    }
}