import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BedDouble, Bath, MapPin, Heart } from "lucide-react";

interface ListingCardProps {
  listing: {
    id: string;
    title: string;
    price: string;
    address: string;
    city: string;
    bedrooms: number;
    bathrooms: number;
    listingType: string;
    images: Array<{ url: string }>;
  };
}

export function ListingCard({ listing }: ListingCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/listings/${listing.id}`}>
        <div className="relative h-48 w-full">
          <Image
            src={listing.images[0]?.url || "/placeholder.jpg"}
            alt={listing.title}
            fill
            className="object-cover"
          />
          <Badge className="absolute top-2 left-2">
            {listing.listingType}
          </Badge>
        </div>
      </Link>
      
      <CardContent className="p-4">
        <Link href={`/listings/${listing.id}`}>
          <h3 className="font-semibold text-lg hover:text-blue-600 transition">
            {listing.title}
          </h3>
        </Link>
        
        <div className="flex items-center text-gray-600 text-sm mt-2">
          <MapPin className="w-4 h-4 mr-1" />
          <span>{listing.address}, {listing.city}</span>
        </div>
        
        <p className="text-2xl font-bold text-yellow-500 mt-3">
          ${listing.price}
        </p>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <BedDouble className="w-4 h-4" />
              <span>{listing.bedrooms} beds</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="w-4 h-4" />
              <span>{listing.bathrooms} baths</span>
            </div>
          </div>
          
          <Button variant="ghost" size="icon">
            <Heart className="w-5 h-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}