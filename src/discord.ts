import { Client, GatewayIntentBits, Events } from 'discord.js';
import { WowAuditRaidShortOverview, WowAuditRaider } from './zod/schema';
import { getRaiders, getRaidersWithoutSignups } from './wowaudit';

let discordClient: Client;

export const createClient = async () => {
    discordClient = new Client({
        intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildPresences],
    });

    discordClient.once(Events.ClientReady, async (c) => {
        console.log(`Discord client ready! Logged in as ${c.user.tag}`);
    });

    await discordClient.login(process.env.BOT_TOKEN);
};

const findDiscordProfile = (username: string) => {
    const guild = discordClient.guilds.cache.get(process.env.GUILD_ID_REAL!);
    return guild?.members.cache.find((u) => u.user.username === username);
};

export const deleteOldDMs = async (username: string) => {
    const userProfile = findDiscordProfile(username);

    if (!userProfile) {
        console.error(`Failed to find Discord guild member with username ${username}. Will not delate old messages.`);
    } else {
        console.log('Deleting old DMs');

        const user = await discordClient.users.fetch(userProfile.id);
        const dmChannel = await user.createDM();
        const messages = await dmChannel.messages.fetch({ limit: 99 });

        messages.each((m) => {
            if (!m.author.bot) return;
            m.delete();
        });
    }
};

export const sendDM = async (username: string, text: string) => {
    const userProfile = findDiscordProfile(username);

    if (!userProfile) {
        console.error(`Failed to find Discord guild member with username ${username}. Message won't be sent.`);
    } else {
        try {
            discordClient.users.send(userProfile.id, text);
            console.debug(`Sent message '${text}' to ${username}. Id: ${userProfile.id}`);
        } catch (err) {
            console.error('Failed to send message', err);
        }
    }
};

const generateMissingSignupDays = (raids: Date[]): string => {
    const sortedDays = raids.slice(0).sort((date1, date2) => date1.getTime() - date2.getTime());

    const days = sortedDays.map((raidDate) => {
        const dateNameInCzech = ['neděli', 'pondělí', 'úterý', 'středu', 'čtvrtek', 'pátek', 'sobotu'][raidDate.getDay()];

        const daysFromNowInCzech = () => {
            const daysFromNow = Math.ceil((raidDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24));

            if (daysFromNow === 0) return `**dnes** (v ${dateNameInCzech})`;
            else if (daysFromNow === 1) return `**zítra** (v ${dateNameInCzech})`;
            else if (daysFromNow === 2) return `**pozítří** (v ${dateNameInCzech})`;
            else return `**v ${dateNameInCzech}** (za ${daysFromNow} dny)`;
        };

        return daysFromNowInCzech();
    });

    return `${days.length >= 3 ? days.slice(0, days.length - 2).join(', ') : ''}${days.length >= 2 ? days[days.length - 2] + ' a ' : ''}${
        days[days.length - 1]
    }`;
};

export const sendSignupNotifications = async (upcomingRaids: WowAuditRaidShortOverview[]) => {
    const completeSlackerList = new Map<WowAuditRaider, Date[]>();
    const raiders = await getRaiders();

    await Promise.all(
        upcomingRaids.map(async (upcomingRaid) => {
            const slackers = await getRaidersWithoutSignups(upcomingRaid.id, raiders);

            slackers.forEach((slacker) => {
                if (!completeSlackerList.has(slacker)) {
                    completeSlackerList.set(slacker, [new Date(upcomingRaid.date)]);
                } else {
                    completeSlackerList.get(slacker)?.push(new Date(upcomingRaid.date));
                }
            });
        })
    );

    for (const entry of completeSlackerList.entries()) {
        const [slacker, missingRaidDates] = entry;

        if (!slacker.note) {
            console.error(`Somehow processing slacker ${slacker.name} without set note. Skipping...`);
            return;
        }

        await deleteOldDMs(slacker.note);
        await sendDM(
            slacker.note,
            `Čau, zapomněl ses zapsat na raid ${generateMissingSignupDays(
                missingRaidDates
            )}. Dej nám prosím co nejdřív vědět jak to vypadá, než se Erdmoon oběsí. Dík! :heart:`
        );
    }

    return completeSlackerList;
};
