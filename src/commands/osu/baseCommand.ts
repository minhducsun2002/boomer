import type { PepperCommand } from '@pepper/struct';
import { extendCommand } from '@pepper/struct';
import { client } from '@pepper/client';
import User from '@pepper/modules/osu/username-db';
import Cache from '@pepper/modules/osu/map-cache';
import { countries } from 'countries-list';


export const OsuCommand = class extends extendCommand({
    category: 'osu!', typing: true, prefix: client.config.prefix['osu']
}) {
    constructor(...args: ConstructorParameters<typeof PepperCommand>) {
        super(`osu-${args[0]}`, args[1]);
    }

    get mapIdCache() {
        return this.resolveModule(Cache);
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
        let username = (await client.moduleHandler.findInstance(User).getUser(target))?.osuUsername;
        if (!username)
            throw new Error(
                `User ID ${target} has not been bound to any username.`
                + `\nUse ${(this.prefix as string[])[0]}${this.aliases[0]} <username> to set one.`
            )
        return username;
    }

    resolveEarthEmoji(countryCode : string) {
        switch (countries[countryCode.toUpperCase() as keyof typeof countries]?.continent) {
            case 'AF':
            case 'EU': return `:earth_africa:`;
            case 'NA':
            case 'SA': return `:earth_americas:`
            default: return `:earth_asia:`;
        }
    }
}