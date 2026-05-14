import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import { getCart, addToCart as apiAddToCart, updateCartItem, removeFromCart as apiRemoveFromCart, clearCart as apiClearCart } from '../services/cart.service';
import { useAuth } from './AuthContext';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  variants?: Record<string, string>;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (itemToAdd: any, quantity: number, selectedAttributes?: Record<string, string>) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  subtotal: number;
  shipping: number;
  total: number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartContextProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Helper function to map backend data to frontend CartItem interface
  const mapCartData = (cartData: any) => {
    if (!cartData || !cartData.items) return [];
    
    return cartData.items.map((item: any) => {
      // Base product
      const product = item.productId;
      const variant = item.variantId;
      
      // Calculate final price based on discount
      const productPrice = product?.basePrice * (1 - (product?.discountPercentage || 0) / 100);
      const variantPrice = variant ? variant.price * (1 - (variant.discountPercentage || 0) / 100) : productPrice;

      // Extract image
      const image = variant?.images?.[0] || product?.images?.[0] || 'https://via.placeholder.com/150';

      // Format variants for UI
      const variantsObj: Record<string, string> = {};
      if (variant?.attributes) {
        variant.attributes.forEach((attr: any) => {
          variantsObj[attr.name] = attr.value;
        });
      }

      return {
        id: item._id, // This is the CartItem _id from backend
        productId: product?._id,
        name: product?.name || 'Unknown Product',
        price: variantPrice || productPrice || 0,
        image,
        quantity: item.quantity,
        variants: Object.keys(variantsObj).length > 0 ? variantsObj : undefined,
      };
    });
  };

  const fetchCart = async () => {
    if (!user?._id) {
      setCartItems([]);
      return;
    }
    
    setLoading(true);
    try {
      const data = await getCart(user._id);
      setCartItems(mapCartData(data));
    } catch (error) {
      console.error('Failed to fetch cart', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user?._id]);

  const addToCart = async (itemToAdd: any, quantity: number, selectedAttributes?: Record<string, string>) => {
    if (!isAuthenticated || !user?._id) {
      Alert.alert("Yêu cầu đăng nhập", "Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng");
      return;
    }

    try {
      const productId = itemToAdd.id || itemToAdd._id;
      const variantId = itemToAdd.variantId;
      
      await apiAddToCart(user._id, productId, variantId, quantity);
      await fetchCart();
      Alert.alert("Thành công", "Đã thêm sản phẩm vào giỏ hàng!");
    } catch (error) {
      Alert.alert("Lỗi", "Không thể thêm vào giỏ hàng");
      console.error(error);
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (!user?._id) return;

    try {
      // Optimitic update UI
      setCartItems(prev => prev.filter(item => item.id !== itemId));
      await apiRemoveFromCart(user._id, itemId);
    } catch (error) {
      console.error(error);
      fetchCart();
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!user?._id || quantity < 1) return;
    
    try {
      setCartItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      ));
      await updateCartItem(user._id, itemId, quantity);
    } catch (error) {
      console.error(error);
      fetchCart();
    }
  };

  const clearCart = async () => {
    if (!user?._id) return;
    try {
      setCartItems([]);
      await apiClearCart(user._id);
    } catch (error) {
      console.error(error);
      fetchCart();
    }
  };

  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const shipping = cartItems.length > 0 ? 30000 : 0;
  const total = subtotal + shipping;

  return (
    <CartContext.Provider 
      value={{ 
        cartItems, 
        addToCart, 
        removeFromCart, 
        updateQuantity, 
        clearCart,
        subtotal,
        shipping,
        total,
        loading
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartContextProvider');
  }
  return context;
}
