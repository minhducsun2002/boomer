import { componentLog } from '@pepper/utils';
import axios from 'axios';
import { OsuModule } from "./base";

export = class extends OsuModule {
    private log = new componentLog('osu!api Client Credentials token');
    private _token : string;

    constructor() {
        super(`api-oauth2-bearer-token`);
    }

    private async refreshToken(clientSecret : string, clientId : number) {
        let response = await axios.post(`https://osu.ppy.sh/oauth/token`,
            {
                client_id: `${clientId}`,
                client_secret: clientSecret,
                grant_type: 'client_credentials',
                scope: 'public'
            },
            { validateStatus: () => true }
        );

        if (response.status !== 200)
            throw new Error(`Failed to acquire an access token : ${response.status} ${response.statusText}`);

        let { expires_in, access_token } = response.data as { expires_in: number, access_token: string };
        this._token = access_token;
        setTimeout(() => this.refreshToken(clientSecret, clientId), expires_in * 1000);
        this.log.success(`Successfully acquired token, valid for ${expires_in} seconds.`)
    }

    get token() { return this._token; }

    async initialize() {
        let { OSU_OAUTH2_CLIENT_SECRET, OSU_OAUTH2_CLIENT_ID } = process.env;
        if (!OSU_OAUTH2_CLIENT_ID || !OSU_OAUTH2_CLIENT_SECRET)
            this.log.warning(
                `No osu! OAuth2 client secret and/or client ID was provided.`
                + `\nThere is high chance that the token request results in a 401 response.`
            );

        await this.refreshToken(OSU_OAUTH2_CLIENT_SECRET, +OSU_OAUTH2_CLIENT_ID);
    }
}