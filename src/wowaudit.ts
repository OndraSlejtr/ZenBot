import axios from 'axios';
import { WowAuditRaidDetail, WowAuditRaidList, raidDetailSchema, raidsSchema } from './zod/schema';
import { Raider, findRaider } from './players';
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

export const getRaidersWithoutSignups = async (raid: RaidID): Promise<Raider[]> => {
  const raidData = await getRaidDetail(raid);

  return raidData.signups
    .filter((signup) => signup.status === 'Unknown')
    .flatMap((signup) => {
      // Using flat map to skip over raiders who we couldn't pair with a raider
      const raider = findRaider(signup.character.name);

      if (!raider) {
        console.error(`We were unable to match character ${signup.character.name} with any known Raider in application database. They will be skipped.`);
        return [];
      }

      return [raider];
    }).filter((raider) => !raider.ignoreSignups);
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
    return raidDate > today && raidDate < cutoffDate && (!ignoreFriday || raidDate.getDay() != FRIDAY_IN_WEEK);
  });

  return raidsInRange;
};

export const x = async () => {
  const upcomingRaids = await getUpcomingRaids(SIGNUP_CHECK_CUTOFF, true); // Ignoring Friday altruns
};
