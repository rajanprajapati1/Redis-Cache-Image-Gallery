// app/api/wishlist/route.js
import { NextResponse } from 'next/server';
import redis from '@/lib/Redis';

export async function GET(request) {
  try {
    // Get the wishlist from Redis (you can use a user ID or session as part of the key)
    const wishlistKey = 'user:123:wishlist';  // Example key; this could be dynamic based on user
    const wishlist = await redis.get(wishlistKey);

    if (wishlist) {
      console.log('Wishlist fetched from cache');
      return NextResponse.json(JSON.parse(wishlist));  // Return the wishlist
    }

    console.log('No wishlist found in cache');
    return NextResponse.json({ wishlist: [] });  // Return an empty array if no wishlist is found
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { id, imageUrl, likes, comments } = await request.json();  // Assume we're passing the full image data

    const wishlistKey = 'user:123:wishlist';  // Example key for the user's wishlist

    // Get the current wishlist from Redis
    let wishlist = await redis.get(wishlistKey);
    wishlist = wishlist ? JSON.parse(wishlist) : [];

    // Check if the image is already in the wishlist
    const itemExists = wishlist.some(item => item.id === id);

    if (!itemExists) {
      // Add the new image data to the wishlist
      wishlist.push({ id, imageUrl, likes, comments });
    }

    // Store the updated wishlist back in Redis, with an expiration of 24 hours (86400 seconds)
    await redis.set(wishlistKey, JSON.stringify(wishlist), 'EX', 86400);

    console.log('Item added to wishlist');
    return NextResponse.json({ success: true, wishlist });
  } catch (error) {
    console.error('Error adding item to wishlist:', error);
    return NextResponse.json({ error: 'Failed to add item to wishlist' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();  // Assume we're passing the image ID to remove

    const wishlistKey = 'user:123:wishlist';  // Example key for the user's wishlist

    // Get the current wishlist from Redis
    let wishlist = await redis.get(wishlistKey);
    wishlist = wishlist ? JSON.parse(wishlist) : [];

    // Remove the item with the given ID from the wishlist
    wishlist = wishlist.filter(item => item.id !== id);

    // Store the updated wishlist back in Redis
    await redis.set(wishlistKey, JSON.stringify(wishlist), 'EX', 86400);

    console.log('Item removed from wishlist');
    return NextResponse.json({ success: true, wishlist });
  } catch (error) {
    console.error('Error removing item from wishlist:', error);
    return NextResponse.json({ error: 'Failed to remove item from wishlist' }, { status: 500 });
  }
}
