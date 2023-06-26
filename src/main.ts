import { SIGNUP_CHECK_CUTOFF } from './config';
import { getUpcomingRaids } from './wowaudit';
import { createClient, sendDM, sendSignupNotifications } from './discord';
import express from 'express';

import 'dotenv/config';

export const main = async () => {
    console.log('Starting app');
    await createClient();

    const upcomingRaids = await getUpcomingRaids(SIGNUP_CHECK_CUTOFF);
    await sendSignupNotifications(upcomingRaids);
};

const app = express();
const port = 3000;

app.get('/check-signups', async (req: any, res: any) => {
    await main();
    res.send('Done');
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});

// Feature roadmap
//
// Every 24 hours at midnight, check raids in upcoming 2 days and send request to everyone who is not accepted to sign up (raid on Wednesday, reminder sent on Monday 23:59, Tuesday 23:59) DONE
// Do it in batch (more raids overlapping)  DONE
// Delete your old messages to person before sending new ones   DONE
// Run in cloud
// Fetch Raiders and their Discord Usernames from WowAudit (single source of truth) DONE
//
// KILLER FEATURE: Generate link to click if you can come (quick accept)    CANNOT BE DONE :(
//
// Nice to have:
// Generate random message format from bot (random greeting, emoji, different reason for appeal...) DONE
// Require note for tentative or late signups?
// Correct date spelling gen xd
//
