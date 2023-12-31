import axios from 'axios';
import { WowAuditRaidDetail, WowAuditRaidList, WowAuditRaider, raidDetailSchema, raidersSchema, raidsSchema } from './zod/schema';
import { findRaider } from './players';
import { SIGNUP_CHECK_CUTOFF } from './config';

type RaidID = number;

export const fetchRaids = async (): Promise<WowAuditRaidList> => {
    const { data } = await axios.get('https://wowaudit.com/v1/raids', {
        headers: { Authorization: process.env.WOWAUDIT_APIKEY },
    });

    //   console.debug(`Fetch raid overview from WoWAudit`, data);
    return raidsSchema.parse(data).raids;
};

export const getRaidDetail = async (raid: RaidID): Promise<WowAuditRaidDetail> => {
    const { data } = await axios.get(`https://wowaudit.com/v1/raids/${raid}`, {
        headers: { Authorization: process.env.WOWAUDIT_APIKEY },
    });

    //   console.debug(`Fetch single detail data from WoWAudit`, data);
    return raidDetailSchema.parse(data);
};

export const getRaiders = async (): Promise<WowAuditRaider[]> => {
    const { data } = await axios.get(`https://wowaudit.com/v1/characters/`, {
        headers: { Authorization: process.env.WOWAUDIT_APIKEY },
    });

    return raidersSchema.parse(data);
};

export const getRaidersWithoutSignups = async (raid: RaidID, raiders: WowAuditRaider[]): Promise<WowAuditRaider[]> => {
    const raidData = await getRaidDetail(raid);

    return raidData.signups
        .filter((signup) => signup.status === 'Unknown')
        .flatMap((signup) => {
            // Using flat map to skip over raiders who we couldn't pair
            const raider = findRaider(raiders, signup.character.name);

            if (!raider?.note) {
                console.error(
                    `Unsigned raider ${signup.character.name} doesn't have their Discord ID set in Wowaudit note. They will be skipped.`
                );
                return [];
            }

            return [raider];
        })
        .filter((raider) => raider.note);   // ignore players without note, we can't contact them anyway
};

// -----------------------------------------------------------------------------------------------------------------------

const FRIDAY_IN_WEEK = 5; // Americani jsou retardi

export const getUpcomingRaids = async (daysForward: number, ignoreFriday: boolean = true): Promise<WowAuditRaidList> => {

    const today = new Date();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + daysForward);

    const raids = await fetchRaids();
    
    const raidsInRange = raids.filter((raid) => {
        const raidDate = new Date(raid.date);
        raidDate.setHours(18, 45, 0);
        return raidDate >= today && raidDate < cutoffDate && (!ignoreFriday || raidDate.getDay() != FRIDAY_IN_WEEK);
    });

    console.log('raidsInRange', raidsInRange)

    return raidsInRange;
};

export const x = async () => {
    const upcomingRaids = await getUpcomingRaids(SIGNUP_CHECK_CUTOFF, true); // Ignoring Friday altruns
};
