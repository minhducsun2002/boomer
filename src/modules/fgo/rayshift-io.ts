import { URL } from 'url';
import Axios from 'axios';
import { FgoModule } from './base';

const { RAYSHIFT_IO_API_KEY } = process.env;
export = class extends FgoModule {
    constructor() {
        super('rayshift-io', {});
    }

    private endpoint = 'https://rayshift.io/api/v1/avalon-data-export/quests/';

    async get(path: string) {
        let url = new URL(this.endpoint + path);
        url.searchParams.set('apiKey', RAYSHIFT_IO_API_KEY);
        return Axios.get(url.href, { responseType: 'json' })
            .then(response => response.data)
            .then(response => {
                if (!(200 <= response.status && response.status <= 299))
                    throw new Error(`Calling Rayshift.io failed : status was ${response.status} with message "${response.message}"`);
                return response.response;
            });
    }

    async queries(id : number[]) {
        let _ = this.query;
        return await this.get(`get?${id.map(num => `ids=${num}`).join('&')}`) as ReturnType<typeof _>;
    }

    async query(id : number) {
        return (
            await this.get(`get?id=${id}`)
        ) as {
            questDetails: {
                [k : number]: {
                    battleId: number,
                    region: 1 | 2,
                    questId: number,
                    questPhase: 1,
                    enemyDeck: {
                        svts: {
                            uniqueId: number,
                            name: string,
                            roleType: number,
                            npcId: number,
                            index: number,
                            id: number,
                            userSvtId: number,
                            isFollowerSvt: boolean,
                            npcFollowerSvtId: number
                        }[]
                    }[],
                    userSvt: {
                        id: number,
                        recover: number,
                        chargeTurn: number,
                        skillId1: number, skillId2: number, skillId3: number,
                        skillLv1: number, skillLv2: number, skillLv3: number,
                        treasureDeviceId: number, treasureDeviceLv: number,
                        criticalRate: number,
                        aiId: number, actPriority: number,
                        maxActNum: number,
                        starRate: number, tdRate: number, deathRate: number,
                        individuality: number[];
                        lv: number, exp: number, atk: number, hp: number,
                        tdAttackRate: number, svtId: number
                    }[]
                }
            }
        }
    }

    async list(region : 1 | 2 = 1, questId?: number, questPhase? : number) {
        return (
            await this.get(`list?region=${region}${questId ? `&questId=${questId}` : ''}${questPhase ? `&questPhase=${questPhase}` : ''}`)
        ) as {
            quests: {
                questId: number,
                questPhase: number,
                count: number,
                lastUpdated: string,
                queryIds: number[],
                region: 1 | 2
            }[]
        }
    }
}