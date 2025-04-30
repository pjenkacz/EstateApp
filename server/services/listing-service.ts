import { db } from "../db";
import { listings } from "../db/schema";
import { eq, and, gte, lte, sql, type SQL } from "drizzle-orm";
import type {
  CreateListingInput,
  UpdateListingInput,
  SearchListingsInput,
} from "../validators/listing";

export async function createListing(data: CreateListingInput, userId: string) {
  const [listing] = await db
    .insert(listings)
    .values({
      title: data.title,
      description: data.description,
      price: data.price.toString(),
      listingType: data.listingType,
      propertyType: data.propertyType,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      area: data.area?.toString(),
      address: data.address,
      city: data.city,
      country: data.country,
      latitude: data.latitude.toString(),
      longitude: data.longitude.toString(),
      userId,
    })
    .returning();

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
  const conditions: SQL[] = [];

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

  if (params.latitude !== undefined && params.longitude !== undefined) {
    const earthRadius = 6371;
    const lat = params.latitude;
    const lng = params.longitude;
    const radius = params.radius ?? 10;

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
  const [updated] = await db
    .update(listings)
    .set({
      title: data.title,
      description: data.description,
      price: data.price?.toString(),
      listingType: data.listingType,
      propertyType: data.propertyType,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      area: data.area?.toString(),
      address: data.address,
      city: data.city,
      country: data.country,
      latitude: data.latitude?.toString(),
      longitude: data.longitude?.toString(),
      updatedAt: new Date(),
    })
    .where(and(eq(listings.id, id), eq(listings.userId, userId)))
    .returning();

  return updated;
}

export async function deleteListing(id: string, userId: string) {
  await db.delete(listings).where(and(eq(listings.id, id), eq(listings.userId, userId)));
}