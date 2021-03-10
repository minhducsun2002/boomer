import type { PepperCommand } from '@pepper/struct';
import { extendCommand } from '@pepper/struct';
import { client } from '@pepper/client';
import User from '@pepper/modules/osu/username-db';

export const OsuCommand = class extends extendCommand({
    category: 'osu!', typing: true, prefix: client.config.prefix['osu']
}) {
    constructor(...args: ConstructorParameters<typeof PepperCommand>) {
        super(`osu-${args[0]}`, args[1]);
    }

    async resolveUserFromAuthor(user : string, author : string) {
        let target = author;
        if (user) {
            if (user.match(/^<@!?(\d+)>$/)) {
                // mention. resolve as user id
                let { id } = await this.client.users.fetch(user.match(/^<@!?(\d+)>$/)[1], false);
                target = id;
            } else return user;
        }
        return (await client.moduleHandler.findInstance(User).getUser(target)).osuUsername;
    }
}