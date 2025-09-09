import { z } from 'zod';

export const ruleSchema = z.object({
    enabled: z.union([z.boolean(), z.iso.date()]),
    multi: z.boolean().optional(),
    conditions: z.object({
        dayOfWeek: z.union([z.number(), z.array(z.number())]),
        place: z.enum(['Gdansk', 'Gdynia']),
        titlePatterns: z.array(
            z.union([z.string(), z.object({ negated: z.boolean(), pattern: z.string() })]),
        ),
        timeSlot: z.object({ start: z.iso.time(), end: z.iso.time() }).optional(),
    }),
});
export type Rule = z.infer<typeof ruleSchema>;

export const eventSchema = z.object({
    start: z.iso.datetime(),
    end: z.iso.datetime(),
    title: z.string().nonempty(),
    description: z.string().optional(),
    url: z.string(),
    link: z.url(),
    place: z.enum(['Gdansk', 'Gdynia']),
    date: z.iso.date(),
    isSlotAvailable: z.boolean().optional(),
    assigned: z.boolean().optional(),
});
export type Event = z.infer<typeof eventSchema>;

export const participantsDataSchema = z.object({
    participants: z.number().nonnegative(),
    total: z.number().nonnegative(),
});
export type ParticipantsData = z.infer<typeof participantsDataSchema>;
