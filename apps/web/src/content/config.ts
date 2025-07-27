import { defineCollection, z } from 'astro:content';

const wikiCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    updatedDate: z.date().optional(),
  }),
});

export const collections = {
  wiki: wikiCollection,
};
