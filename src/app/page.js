"use client"
import { useState, useEffect, useCallback } from "react"
import Masonry from "react-masonry-css"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, LoaderCircleIcon, MessageCircle, Share2 } from "lucide-react"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

export default function Component() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("popular");
  const [columnCount, setColumnCount] = useState(4);
  const [selectedItem, setSelectedItem] = useState(null);

  // Function to fetch images
  const fetchImages = async (page) => {
    if (loading) return; // Prevent multiple requests at the same time
    setLoading(true);
    try {
      const response = await fetch(`/api/images?search=${search}&page=${page}`);
      const data = await response.json();

      if (data.hits && data.hits.length > 0) {
        setItems((prevItems) => [...prevItems, ...data.hits]);
        setHasMore(data.hits.length === 150); // If we get 150 items, we can fetch more
      } else {
        setHasMore(false); // No more images available
      }
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load more images when the page loads or when the page changes
  useEffect(() => {
    fetchImages(page);
  }, [page]);

  // Function to handle scroll event
  const handleScroll = useCallback(() => {
    if (loading || !hasMore) return; // Don't trigger if already loading or no more data
    const bottom = window.innerHeight + document.documentElement.scrollTop === document.documentElement.offsetHeight;
    if (bottom) {
      setPage((prevPage) => prevPage + 1); // Increment the page number when scrolled to the bottom
    }
  }, [loading, hasMore]);

  // Add scroll event listener
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll); // Cleanup on component unmount
  }, [handleScroll]);

  const HandleLiked = async(data) => {
    const payload = {
      id: data?.id, imageUrl: data?.webformatURL, likes: data?.likes, comments: data?.comments
    }
    try {
      const res = await fetch('/api/liked', {
        method: "POST",
        body: JSON.stringify(payload)
      })
      const responseData = await res.json();
      console.log(responseData)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <Masonry
        breakpointCols={columnCount}
        className="flex w-auto -ml-4"
        columnClassName="pl-4 bg-clip-padding"
      >
        {items.map((item) => (
          <Card key={item.id} className="mb-3 rounded overflow-hidden transition-all hover:shadow-lg">
            <CardContent className="p-0">
              <div 
                className="relative group cursor-pointer" 
                onClick={() => setSelectedItem(item)}
              >
                <Image
                  src={item.webformatURL}
                  alt={item.tags}
                  width={300}
                  height={300}
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <h3 className="text-white text-xl font-bold p-4">{item.tags}</h3>
                </div>
              </div>
            </CardContent>
            <CardFooter className="py-1 px-4 flex justify-between items-center">
              <div className="flex gap-4">
                <Button onClick={(e) => {
                  e.stopPropagation();
                  HandleLiked(item);
                }} variant="ghost" size="icon" className="hover:text-primary">
                  <Heart className="h-4 w-4" />
                  <span className="ml-2 text-sm">{item.likes}</span>
                </Button>
                <Button variant="ghost" size="icon" className="hover:text-primary">
                  <MessageCircle className="h-4 w-4" />
                  <span className="ml-2 text-sm">{item.comments}</span>
                </Button>
              </div>
              <Button variant="ghost" size="icon" className="hover:text-primary">
                <Share2 className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </Masonry>
      {loading && (
        <div className="loader w-full flex items-center justify-center">
          <LoaderCircleIcon size={35} className="animate-spin transition-all"/>
        </div>
      )}

      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="sm:max-w-[80vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Image Details</DialogTitle>
            <DialogDescription>Information about the selected image.</DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Image
                  src={selectedItem.largeImageURL || selectedItem.webformatURL}
                  alt={selectedItem.tags}
                  width={800}
                  height={600}
                  className="w-full h-auto object-cover rounded-lg"
                />
              </div>
              <div className="space-y-4">
                <p><strong>Tags:</strong> {selectedItem.tags}</p>
                <p><strong>User:</strong> {selectedItem.user}</p>
                <p><strong>Views:</strong> {selectedItem.views}</p>
                <p><strong>Downloads:</strong> {selectedItem.downloads}</p>
                <p><strong>Likes:</strong> {selectedItem.likes}</p>
                <p><strong>Comments:</strong> {selectedItem.comments}</p>
                <p><strong>Resolution:</strong> {selectedItem.imageWidth} x {selectedItem.imageHeight}</p>
                <p><strong>Type:</strong> {selectedItem.type}</p>
                <div className="flex gap-2">
                  <Button onClick={() => HandleLiked(selectedItem)}>Like</Button>
                  <Button variant="outline">
                    <Share2 className="mr-2 h-4 w-4" /> Share
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}