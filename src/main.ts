import { SIGNUP_CHECK_CUTOFF } from './config';
import { fetchRaids, getRaidersWithoutSignups, getUpcomingRaids } from './wowaudit';
import { createClient, sendDM, sendSignupNotifications } from './discord';
import { mapToDiscordUsername } from './players';

import 'dotenv/config';

const main = async () => {
    console.log('Starting app');
    await createClient();

    const upcomingRaids = await getUpcomingRaids(SIGNUP_CHECK_CUTOFF);

    sendSignupNotifications(upcomingRaids);
};

main();

// Feature roadmap
//
// Every 24 hours at midnight, check raids in upcoming 2 days and send request to everyone who is not accepted to sign up (raid on Wednesday, reminder sent on Monday 23:59, Tuesday 23:59) DONE
// Do it in batch (more raids overlapping)  DONE
// Delete your old messages to person before sending new ones   DONE
// Run in cloud
// Fetch Raiders and their Discord Usernames from WowAudit (single source of truth)
//
// KILLER FEATURE: Generate link to click if you can come (quick accept)
//
// Nice to have:
// Generate random message format from bot (random greeting, emoji, different reason for appeal...)
// Require note for tentative or late signups?
// Correct date spelling gen xd
//
