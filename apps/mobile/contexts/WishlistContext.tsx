import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { getWishlist, toggleWishlist as toggleService } from "@/services/wishlist.service";

interface WishlistContextType {
  wishlistItems: any[];
  wishlistCount: number;
  loading: boolean;
  fetchWishlist: () => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  isWishlisted: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = async () => {
    if (!user?._id) {
      setWishlistItems([]);
      return;
    }
    setLoading(true);
    try {
      const data = await getWishlist(user._id);
      if (data && data.items) {
        setWishlistItems(data.items);
      } else {
        setWishlistItems([]);
      }
    } catch (error) {
      console.error("Error fetching wishlist in context:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?._id) {
      fetchWishlist();
    } else {
      setWishlistItems([]);
    }
  }, [isAuthenticated, user?._id]);

  const toggleWishlist = async (productId: string) => {
    if (!user?._id) return;
    try {
      const alreadyWishlisted = isWishlisted(productId);
      if (alreadyWishlisted) {
        // Optimistic update: remove from local items immediately
        setWishlistItems((prev) => prev.filter((item) => (item.productId?._id || item.productId) !== productId));
      } else {
        // Optimistic update: add temporary placeholder
        setWishlistItems((prev) => [...prev, { productId: { _id: productId } }]);
      }
      
      await toggleService(user._id, productId);
      // Fetch full actual updated data from server to keep list in sync
      await fetchWishlist();
    } catch (error) {
      console.error("Error toggling wishlist in context:", error);
      fetchWishlist(); // Revert on failure
    }
  };

  const isWishlisted = (productId: string) => {
    return wishlistItems.some((item) => (item.productId?._id || item.productId) === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistCount: wishlistItems.length,
        loading,
        fetchWishlist,
        toggleWishlist,
        isWishlisted,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistContextProvider");
  }
  return context;
};
