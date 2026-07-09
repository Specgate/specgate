import { z } from "zod";
import { PageInfoSchema } from "../common/list.contract";
import { CurrencyCodeSchema } from "../money/currency.schema";

const isoDateString = z.string().datetime({ offset: true });

export const PublicPortfolioShowcaseListInputSchema = z.object({
  q: z.string().optional(),
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().max(100).optional(),
  type: z.string().optional(),
});
export type PublicPortfolioShowcaseListInput = z.infer<
  typeof PublicPortfolioShowcaseListInputSchema
>;

export const PublicPortfolioShowcaseSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  workspaceId: z.string(),
  type: z.string(),
  name: z.string(),
  slug: z.string(),
  primaryDomain: z.string().nullable(),
  isPublished: z.boolean(),
  createdAt: isoDateString,
  updatedAt: isoDateString,
});
export type PublicPortfolioShowcase = z.infer<typeof PublicPortfolioShowcaseSchema>;

export const PublicPortfolioShowcasesOutputSchema = z.object({
  items: z.array(PublicPortfolioShowcaseSchema),
  pageInfo: PageInfoSchema,
});
export type PublicPortfolioShowcasesOutput = z.infer<
  typeof PublicPortfolioShowcasesOutputSchema
>;

export const PublicRentalCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
});
export type PublicRentalCategory = z.infer<typeof PublicRentalCategorySchema>;

export const PublicRentalPropertySchema = z.object({
  id: z.string(),
  status: z.literal("PUBLISHED"),
  slug: z.string(),
  name: z.string(),
  summary: z.string().nullable(),
  descriptionHtml: z.string().nullable(),
  maxGuests: z.number().int().positive(),
  coverImageFileId: z.string().nullable(),
  price: z.number().nonnegative(),
  currency: CurrencyCodeSchema,
  images: z.array(z.unknown()),
  categories: z.array(PublicRentalCategorySchema),
  publishedAt: isoDateString,
  createdAt: isoDateString,
  updatedAt: isoDateString,
});
export type PublicRentalProperty = z.infer<typeof PublicRentalPropertySchema>;

export const ListPublicRentalPropertiesOutputSchema = z.array(PublicRentalPropertySchema);
export type ListPublicRentalPropertiesOutput = z.infer<
  typeof ListPublicRentalPropertiesOutputSchema
>;

export const GetPublicRentalPropertyOutputSchema = PublicRentalPropertySchema;
export type GetPublicRentalPropertyOutput = z.infer<
  typeof GetPublicRentalPropertyOutputSchema
>;

export const ListRentalCategoriesOutputSchema = z.array(PublicRentalCategorySchema);
export type ListRentalCategoriesOutput = z.infer<typeof ListRentalCategoriesOutputSchema>;
