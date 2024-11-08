// app/api/images/route.js
import { NextResponse } from 'next/server';
import redis from '@/lib/Redis';

export async function GET(request) {
  const search = request.nextUrl.searchParams.get("search");
  const page = parseInt(request.nextUrl.searchParams.get("page")) || 1;  // Default to page 1
  const query = search || 'nature';  // Default to 'nature' if no search query is provided
  const cacheKey = `images:${query}:page:${page}`; // Use both query and page to generate unique cache keys
  
  try {
    // Step 1: Check Redis cache
    const cachedData = await redis.get(cacheKey);
    
    if (cachedData) {
      console.log('Cache hit');
      return NextResponse.json(JSON.parse(cachedData));
    }

    // Step 2: Fetch data from Pixabay API with pagination
    const pixabayResponse = await fetch(
      `${process.env.PIXABAY_API_URL}?key=${process.env.PIXABAY_API_KEY}&q=${query}&per_page=150&page=${page}&safesearch=true`
    );
    const data = await pixabayResponse.json();

    // Step 3: Cache the new data in Redis (set expiration time as 1 hour)
    await redis.set(cacheKey, JSON.stringify(data), 'EX', 3600); // Expiry time of 1 hour

    console.log('Cache miss, data fetched');
    
    // Return the fresh data as JSON
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
