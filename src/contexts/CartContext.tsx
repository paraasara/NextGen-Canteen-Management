
import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, MenuItem } from '../types';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from 'react-router-dom';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: string | number) => void;
  updateQuantity: (itemId: string | number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  placeOrder: (pickupTime?: string, notes?: string) => Promise<void>;
  isPlacingOrder: boolean;
  minimumOrderAmount: number;
  canPlaceOrder: boolean;
}

const CartContext = createContext<CartContextType>({
  cartItems: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  totalItems: 0,
  subtotal: 0,
  placeOrder: async () => {},
  isPlacingOrder: false,
  minimumOrderAmount: 50,
  canPlaceOrder: false,
});

export const useCart = () => useContext(CartContext);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const { toast } = useToast();
  const { authState } = useAuth();
  const navigate = useNavigate();
  
  const minimumOrderAmount = 50; // ₹50 minimum to meet Stripe's requirement

  // Load cart from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart_items');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart_items', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item: MenuItem) => {
    // Check if user is logged in before adding to cart
    if (!authState.user) {
      toast({
        title: "Login required",
        description: "Please login to add items to your cart",
        variant: "destructive",
      });
      navigate('/');
      return;
    }

    setCartItems(prevItems => {
      const existingItem = prevItems.find(cartItem => cartItem.id === item.id);
      
      if (existingItem) {
        toast({
          title: "Added to cart",
          description: `${item.name} quantity increased to ${existingItem.quantity + 1}`,
        });
        return prevItems.map(cartItem => 
          cartItem.id === item.id 
            ? { ...cartItem, quantity: cartItem.quantity + 1 } 
            : cartItem
        );
      }
      
      toast({
        title: "Added to cart",
        description: `${item.name} added to your cart`,
      });
      return [...prevItems, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string | number) => {
    setCartItems(prevItems => {
      const removedItem = prevItems.find(item => item.id === itemId);
      if (removedItem) {
        toast({
          title: "Removed from cart",
          description: `${removedItem.name} removed from your cart`,
        });
      }
      return prevItems.filter(item => item.id !== itemId);
    });
  };

  const updateQuantity = (itemId: string | number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart_items');
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart",
    });
  };

  const placeOrder = async (pickupTime?: string, notes?: string) => {
    // Strict authentication check
    if (!authState.user || !authState.session) {
      toast({
        title: "Login required",
        description: "You must be logged in to place an order",
        variant: "destructive",
      });
      navigate('/');
      return;
    }

    if (cartItems.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before placing an order",
        variant: "destructive",
      });
      return;
    }

    if (subtotal < minimumOrderAmount) {
      toast({
        title: "Minimum order amount not met",
        description: `Please add items worth at least ₹${minimumOrderAmount} to place an order`,
        variant: "destructive",
      });
      return;
    }

    if (!pickupTime || pickupTime.trim() === '') {
      toast({
        title: "Pickup time required",
        description: "Please select a pickup time before placing your order",
        variant: "destructive",
      });
      return;
    }
    
    setIsPlacingOrder(true);
    
    try {
      console.log("Initiating Stripe payment for authenticated user:", authState.user.email);
      
      // Call the Stripe payment function with proper authentication
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          cartItems: cartItems.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            quantity: item.quantity
          })),
          subtotal: subtotal,
          pickupTime: pickupTime,
          notes: notes || ''
        }
      });

      if (error) {
        console.error("Stripe payment error:", error);
        throw new Error(error.message);
      }

      if (data?.url) {
        console.log("Redirecting to Stripe checkout:", data.url);
        // Use window.location.href for better compatibility
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received from payment service");
      }
      
    } catch (error) {
      console.error("Error placing order:", error);
      toast({
        title: "Failed to place order",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const canPlaceOrder = subtotal >= minimumOrderAmount && authState.user !== null;

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      totalItems,
      subtotal,
      placeOrder,
      isPlacingOrder,
      minimumOrderAmount,
      canPlaceOrder
    }}>
      {children}
    </CartContext.Provider>
  );
};
