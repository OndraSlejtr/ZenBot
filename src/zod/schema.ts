import { z } from 'zod';

const raidShortOverview = z.object({
    id: z.number(),
    date: z.string(),
    start_time: z.string(),
    end_time: z.string(),
    instance: z.string(),
    difficulty: z.string(),
    status: z.string(),
    present_size: z.number(),
    total_size: z.number(),
});

const innerRaidsSchema = z.array(raidShortOverview);

export const raidsSchema = z.object({
    raids: innerRaidsSchema,
});

export const raidDetailSchema = z.object({
    id: z.number(),
    date: z.string(),
    start_time: z.string(),
    end_time: z.string(),
    instance: z.string(),
    difficulty: z.string(),
    status: z.string(),
    present_size: z.number(),
    total_size: z.number(),
    notes: z.null(),
    selections_image: z.string().nullable(),
    signups: z.array(
        z.object({
            character: z.object({
                id: z.number(),
                name: z.string(),
                realm: z.string(),
                class: z.string(),
                role: z.string(),
            }),
            status: z.string(),
            comment: z.string().nullable(),
            selected: z.boolean(),
            class: z.string(),
            role: z.string(),
        })
    ),
    encounters: z.array(
        z.object({
            name: z.string(),
            id: z.number(),
            enabled: z.boolean(),
            notes: z.null(),
        })
    ),
});

export type WowAuditRaidShortOverview = z.infer<typeof raidShortOverview>;
export type WowAuditRaidList = z.infer<typeof innerRaidsSchema>;
export type WowAuditRaidDetail = z.infer<typeof raidDetailSchema>;
