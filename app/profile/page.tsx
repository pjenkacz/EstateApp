import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { db } from "@/server/db";
import { eq } from "drizzle-orm";
import { users, listings } from "@/server/db/schema";

export default async function ProfilePage() {
  const { userId } = auth();
  
  if (!userId) {
    redirect("/sign-in");
  }
  
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
  
  const userListings = await db.query.listings.findMany({
    where: eq(listings.userId, userId),
    with: {
      images: {
        limit: 1,
      },
    },
  });
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <img 
          src={user?.avatarUrl || "/default-avatar.png"} 
          alt={user?.firstName || "User"}
          className="w-24 h-24 rounded-full mb-4"
        />
        <h2 className="text-2xl font-semibold">
          {user?.firstName} {user?.lastName}
        </h2>
        <p className="text-gray-600">{user?.email}</p>
      </div>
      
      <h2 className="text-2xl font-bold mb-4">My Listings</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userListings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
}