import { db } from "../db";
import { listings, listingImages } from "../db/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import type { CreateListingInput, UpdateListingInput, SearchListingsInput } from "../validators/listing";

export async function createListing(data: CreateListingInput, userId: string) {
  const [listing] = await db.insert(listings).values({
    ...data,
    userId,
  }).returning();
  
  return listing;
}

export async function getListingById(id: string) {
  const listing = await db.query.listings.findFirst({
    where: eq(listings.id, id),
    with: {
      images: true,
      user: {
        columns: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
        },
      },
    },
  });
  
  return listing;
}

export async function searchListings(params: SearchListingsInput) {
  const conditions = [];
  
  if (params.city) {
    conditions.push(eq(listings.city, params.city));
  }
  
  if (params.minPrice !== undefined) {
    conditions.push(gte(listings.price, params.minPrice.toString()));
  }
  
  if (params.maxPrice !== undefined) {
    conditions.push(lte(listings.price, params.maxPrice.toString()));
  }
  
  if (params.bedrooms !== undefined) {
    conditions.push(gte(listings.bedrooms, params.bedrooms));
  }
  
  if (params.listingType) {
    conditions.push(eq(listings.listingType, params.listingType));
  }
  
  if (params.propertyType) {
    conditions.push(eq(listings.propertyType, params.propertyType));
  }
  
  // Geo search with PostGIS
  if (params.latitude && params.longitude) {
    const earthRadius = 6371; // km
    const lat = params.latitude;
    const lng = params.longitude;
    const radius = params.radius;
    
    conditions.push(
      sql`(
        ${earthRadius} * acos(
          cos(radians(${lat})) * 
          cos(radians(${listings.latitude})) * 
          cos(radians(${listings.longitude}) - radians(${lng})) + 
          sin(radians(${lat})) * 
          sin(radians(${listings.latitude}))
        )
      ) <= ${radius}`
    );
  }
  
  const results = await db.query.listings.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    with: {
      images: {
        orderBy: (images, { asc }) => [asc(images.order)],
        limit: 1,
      },
    },
    limit: 50,
  });
  
  return results;
}

export async function updateListing(id: string, data: UpdateListingInput, userId: string) {
  const [updated] = await db.update(listings)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(listings.id, id), eq(listings.userId, userId)))
    .returning();
  
  return updated;
}

export async function deleteListing(id: string, userId: string) {
  await db.delete(listings)
    .where(and(eq(listings.id, id), eq(listings.userId, userId)));
}