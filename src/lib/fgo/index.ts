import { constructQuery as mstClass } from './mstClass';
import { constructQuery as mstSvt } from './mstSvt';
import { constructQuery as mstAttriRelation } from './mstAttriRelation';
import { constructQuery as mstQuest } from './mstQuest';
import { constructQuery as mstSpot } from './mstSpot';
import { constructQuery as mstWar } from './mstWar';
import { constructQuery as mstSvtCard } from './mstSvtCard';
import { constructQuery as mstSvtComment } from './mstSvtComment';
import { constructQuery as mstSvtSkill } from './mstSvtSkill';
import { constructQuery as mstSkillDetail } from './mstSkillDetail';
import { constructQuery as mstItem } from './mstItem';
import { constructQuery as mstQuestConsumeItem } from './mstQuestConsumeItem';
import { constructQuery as mstQuestPhase } from './mstQuestPhase';
import { constructQuery as mstSvtLimit } from './mstSvtLimit';
import { constructQuery as mstSvtTreasureDevice } from './mstSvtTreasureDevice'
import { constructQuery as mstTreasureDeviceLv } from './mstTreasureDeviceLv'
export const constructQuery = {
    mstClass, mstSvt, mstAttriRelation, mstQuest, mstSpot, mstWar, mstSvtCard, mstSvtComment, mstSvtSkill,
    mstSkillDetail, mstItem, mstQuestConsumeItem, mstQuestPhase, mstSvtLimit,
    mstSvtTreasureDevice, mstTreasureDeviceLv
}

export { embedServantBase, embedServantDashboard, embedTreasureDeviceBase } from './embeds';