import { z } from "zod";

export const viewerPaginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().max(32).default(16)
}).transform((data) => ({
    page: data.page,
    limit: data.limit,
    skip: (data.page - 1) * data.limit
}));