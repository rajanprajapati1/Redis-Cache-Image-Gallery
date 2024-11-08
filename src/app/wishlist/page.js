"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function WishlistComponent() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  // Function to fetch the wishlist
  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/liked");
      const data = await response.json();
      console.log(data,"wish")
      if (data) {
        setWishlist(data);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();  // Load wishlist on mount
  }, []);

  // Function to add an item to the wishlist
  const addToWishlist = async (id, imageUrl, likes, comments) => {
    setLoading(true);
    try {
      const response = await fetch("/api/liked", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, imageUrl, likes, comments }),
      });

      const data = await response.json();
      if (data?.success) {
        setWishlist(data?.wishlist);  // Update the local wishlist
      }
    } catch (error) {
      console.error("Error adding item to wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to remove an item from the wishlist
  const removeFromWishlist = async (id) => {
    setLoading(true);
    try {
      const response = await fetch("/api/liked", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();
      if (data.success) {
        setWishlist(data.wishlist);  // Update the local wishlist
      }
    } catch (error) {
      console.error("Error removing item from wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>My Wishlist</h2>
      {loading && <p>Loading...</p>}
      <ul>
        {wishlist?.map((item) => (
          <li key={item.id}>
            <img src={item.imageUrl} alt={`Image ${item.id}`} width={100} height={100} />
            <p>{item.likes} Likes</p>
            <p>{item.comments} Comments</p>
            <Button onClick={() => removeFromWishlist(item.id)}>Remove</Button>
          </li>
        ))}
      </ul>

      <div>
        {/* Example of adding an item to the wishlist */}
        <Button onClick={() => addToWishlist("12345", "https://via.placeholder.com/150", 5, 2)}>
          Add Item to Wishlist
        </Button>
      </div>
    </div>
  );
}
