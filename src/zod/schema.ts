import { z } from 'zod';

const raidShortOverview = z.object({
    id: z.number(),
    date: z.string(),
    start_time: z.string(),
    end_time: z.string(),
    instance: z.string(),
    optional: z.boolean(),
    difficulty: z.string(),
    status: z.string(),
    present_size: z.number(),
    total_size: z.number(),
});

const innerRaidsSchema = z.array(raidShortOverview);

export const raidsSchema = z.object({
    raids: innerRaidsSchema,
});

const signupCharacterSchema = z.object({
    id: z.number(),
    name: z.string(),
    realm: z.string(),
    class: z.string(),
    role: z.string(),
    guest: z.boolean(),
});

const signupSchema = z.object({
    character: signupCharacterSchema,
    status: z.string(),
    comment: z.string().nullable(),
    selected: z.boolean(),
    class: z.string(),
    role: z.string(),
});

const encounterSchema = z.object({
    name: z.string(),
    id: z.number(),
    enabled: z.boolean(),
    extra: z.boolean(),
    notes: z.string().nullable(),
});

export const raidDetailSchema = raidShortOverview.extend({
    notes: z.string().nullable(),
    selections_image: z.string().nullable(),
    signups: z.array(signupSchema),
    encounters: z.array(encounterSchema),
});

const raiderSchema = z.object({
    id: z.number(),
    name: z.string(),
    realm: z.string(),
    class: z.string(),
    role: z.string(),
    rank: z.string(),
    status: z.string(),
    note: z.string().nullable(),
    blizzard_id: z.string().nullable(),
    tracking_since: z.string(),
});

export const raidersSchema = z.array(raiderSchema);

export type WowAuditRaider = z.infer<typeof raiderSchema>;
export type WowAuditRaidShortOverview = z.infer<typeof raidShortOverview>;
export type WowAuditRaidList = z.infer<typeof innerRaidsSchema>;
export type WowAuditRaidDetail = z.infer<typeof raidDetailSchema>;
