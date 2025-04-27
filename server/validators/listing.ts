import { z } from "zod";

export const createListingSchema = z.object({
  title: z.string().min(10).max(200),
  description: z.string().min(50).max(5000).optional(),
  price: z.number().positive(),
  listingType: z.enum(["buy", "rent"]),
  propertyType: z.enum(["apartment", "house", "condo", "land"]),
  bedrooms: z.number().int().min(0).max(20),
  bathrooms: z.number().int().min(0).max(10),
  area: z.number().positive().optional(),
  address: z.string().min(5),
  city: z.string().min(2),
  country: z.string().min(2),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const updateListingSchema = createListingSchema.partial();

export const searchListingsSchema = z.object({
  city: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  bedrooms: z.number().optional(),
  listingType: z.enum(["buy", "rent"]).optional(),
  propertyType: z.enum(["apartment", "house", "condo", "land"]).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  radius: z.number().default(10), // km
});

export type CreateListingInput = z.infer<typeof createListingSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;
export type SearchListingsInput = z.infer<typeof searchListingsSchema>;