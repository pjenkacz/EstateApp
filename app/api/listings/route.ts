import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { searchListings, createListing } from "@/server/services/listing-service";
import { searchListingsSchema, createListingSchema } from "@/server/validators/listing";
import { z } from "zod";
// GET /api/listings?city=Miami&minPrice=100000
export async function GET(req: NextRequest) {
  try {
    const searchParams = Object.fromEntries(req.nextUrl.searchParams);
    
    // Parse numbers from query strings
    const parsed = searchListingsSchema.parse({
      ...searchParams,
      minPrice: searchParams.minPrice ? Number(searchParams.minPrice) : undefined,
      maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
      bedrooms: searchParams.bedrooms ? Number(searchParams.bedrooms) : undefined,
      latitude: searchParams.latitude ? Number(searchParams.latitude) : undefined,
      longitude: searchParams.longitude ? Number(searchParams.longitude) : undefined,
    });
    
    const listings = await searchListings(parsed);
    
    return NextResponse.json({ data: listings });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/listings
export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await req.json();
    const validated = createListingSchema.parse(body);
    
    const listing = await createListing(validated, user.id);
    
    return NextResponse.json({ data: listing }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}