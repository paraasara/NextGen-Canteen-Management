
import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartItemsList from "@/components/cart/CartItemsList";
import CartSummary from "@/components/cart/CartSummary";
import PickupTimeSelector from "@/components/cart/PickupTimeSelector";
import EmptyCart from "@/components/cart/EmptyCart";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Cart = () => {
  const { 
    cartItems, 
    subtotal, 
    placeOrder, 
    minimumOrderAmount, 
    canPlaceOrder 
  } = useCart();
  const { authState } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pickupTime, setPickupTime] = useState("");

  // Get current day and determine opening hours
  const getCurrentDayHours = () => {
    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    
    if (today >= 1 && today <= 5) { // Monday to Friday
      return { open: "08:00", close: "20:00", dayType: "weekday" };
    } else { // Saturday and Sunday
      return { open: "09:00", close: "17:00", dayType: "weekend" };
    }
  };

  // Convert 24-hour format to 12-hour format with AM/PM
  const formatTime12Hour = (time24: string) => {
    if (!time24) return "";
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const validatePickupTime = (time: string) => {
    if (!time) return true; // Empty time is handled elsewhere
    
    const { open, close } = getCurrentDayHours();
    const [hours, minutes] = time.split(':').map(Number);
    const [openHours, openMinutes] = open.split(':').map(Number);
    const [closeHours, closeMinutes] = close.split(':').map(Number);
    
    const timeInMinutes = hours * 60 + minutes;
    const openInMinutes = openHours * 60 + openMinutes;
    const closeInMinutes = closeHours * 60 + closeMinutes;
    
    return timeInMinutes >= openInMinutes && timeInMinutes <= closeInMinutes;
  };

  const handleCheckout = async () => {
    if (!authState.user) {
      toast({
        title: "Login required",
        description: "Please login before placing an order",
        variant: "destructive",
      });
      navigate("/login", { state: { from: "/cart" } });
      return;
    }

    if (!canPlaceOrder) {
      toast({
        title: "Minimum order amount not met",
        description: `Please add items worth at least ₹${minimumOrderAmount} to place an order`,
        variant: "destructive",
      });
      return;
    }

    if (!pickupTime) {
      toast({
        title: "Pickup time required",
        description: "Please select a pickup time to continue",
        variant: "destructive",
      });
      return;
    }

    if (!validatePickupTime(pickupTime)) {
      const { open, close, dayType } = getCurrentDayHours();
      toast({
        title: "Invalid pickup time",
        description: `Pickup time must be between ${formatTime12Hour(open)} and ${formatTime12Hour(close)} for ${dayType === 'weekday' ? 'weekdays' : 'weekends'}`,
        variant: "destructive",
      });
      return;
    }

    try {
      await placeOrder(pickupTime);
    } catch (error) {
      console.error("Checkout failed:", error);
      toast({
        title: "Payment failed",
        description: "Please try again or contact support if the issue persists",
        variant: "destructive",
      });
    }
  };

  // Check if all requirements are met for placing order
  const canProceedToPayment = canPlaceOrder && pickupTime.trim() !== "" && validatePickupTime(pickupTime);

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow bg-gray-50 py-10">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
            <EmptyCart />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow bg-gray-50 py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <CartItemsList />
            </div>
            
            <div>
              <CartSummary
                pickupTime={pickupTime}
                canProceedToPayment={canProceedToPayment}
                onCheckout={handleCheckout}
              />
              <PickupTimeSelector
                pickupTime={pickupTime}
                onTimeChange={setPickupTime}
              />
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Cart;
