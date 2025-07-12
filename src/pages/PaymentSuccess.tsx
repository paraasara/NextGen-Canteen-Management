
import React, { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart, cartItems, subtotal } = useCart();
  const { authState } = useAuth();
  const { toast } = useToast();
  const sessionId = searchParams.get("session_id");
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent creating the order multiple times if the effect re-runs
    if (hasProcessed.current) return;

    if (sessionId && cartItems.length > 0 && authState.user) {
      hasProcessed.current = true;
      const handlePaymentSuccess = async () => {
        try {
          console.log('=== PAYMENT SUCCESS - PROCESSING ORDER ===');
          console.log('Session ID:', sessionId);
          console.log('User:', authState.user.email);
          console.log('Cart items:', cartItems);
          console.log('Subtotal:', subtotal);

          // Create order data structure
          const orderData = {
            user_id: authState.user.id,
            items: cartItems.map(item => ({
              id: item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              description: item.description || ''
            })),
            amount: subtotal,
            pickup_time: 'ASAP',
            status: 'pending',
            notes: `Payment completed. Session ID: ${sessionId}`
          };

          console.log('=== STORING ORDER IN DATABASE ===');
          
          // Store order in Supabase database
          const { data: dbOrder, error } = await supabase
            .from('orders')
            .insert(orderData)
            .select()
            .single();

          if (error) {
            console.error('Database error:', error);
            throw error;
          }

          console.log('✅ Order stored in database:', dbOrder);

          // Generate unique order ID for localStorage
          const uniqueOrderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

          // Create localStorage order data
          const localOrderData = {
            order_id: uniqueOrderId,
            db_order_id: dbOrder.id,
            session_id: sessionId,
            user_email: authState.user.email,
            user_id: authState.user.id,
            items: orderData.items,
            amount: subtotal,
            pickup_time: 'ASAP',
            status: 'pending',
            timestamp: new Date().toISOString(),
            notes: orderData.notes
          };

          console.log('=== STORING ORDER IN LOCALSTORAGE ===');
          
          // Store in localStorage for immediate admin access
          const existingPendingOrders = JSON.parse(localStorage.getItem('pending_orders') || '[]');
          const updatedPendingOrders = [...existingPendingOrders, localOrderData];
          localStorage.setItem('pending_orders', JSON.stringify(updatedPendingOrders));

          console.log('✅ Order stored in localStorage');
          console.log('Total pending orders:', updatedPendingOrders.length);

          // Force immediate admin dashboard update with multiple approaches
          console.log('=== TRIGGERING ADMIN DASHBOARD UPDATES ===');
          
          // 1. Storage event (for cross-tab communication)
          window.dispatchEvent(new StorageEvent('storage', {
            key: 'pending_orders',
            newValue: JSON.stringify(updatedPendingOrders),
            oldValue: JSON.stringify(existingPendingOrders)
          }));

          // 2. Custom event for order updates
          window.dispatchEvent(new CustomEvent('orderUpdate', {
            detail: { 
              type: 'new_order', 
              order: localOrderData,
              dbOrder: dbOrder,
              timestamp: new Date().toISOString()
            }
          }));

          // 3. Broadcast channel for cross-tab communication
          try {
            const channel = new BroadcastChannel('order_updates');
            channel.postMessage({
              type: 'NEW_ORDER',
              order: localOrderData,
              dbOrder: dbOrder,
              timestamp: new Date().toISOString()
            });
            channel.close();
            console.log('✅ Broadcast message sent');
          } catch (error) {
            console.error('Broadcast channel error:', error);
          }

          // 4. Force admin refresh event
          window.dispatchEvent(new CustomEvent('forceAdminRefresh', {
            detail: { 
              type: 'payment_success',
              timestamp: new Date().toISOString() 
            }
          }));

          console.log('✅ All admin update events triggered');

          // Clear the cart after successful payment
          clearCart();
          
          toast({
            title: "Payment Successful!",
            description: "Your order has been placed and is being prepared. Check the admin dashboard for updates.",
          });

        } catch (error) {
          console.error('=== ERROR PROCESSING PAYMENT SUCCESS ===', error);
          toast({
            title: "Payment Successful",
            description: "Your payment was processed, but there was an issue recording your order. Please contact support.",
            variant: "default",
          });
          clearCart();
        }
      };

      handlePaymentSuccess();
    }
  }, [sessionId, cartItems, subtotal, authState.user, clearCart, toast]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow">
            <div className="flex justify-center mb-4">
              <CheckCircle size={64} className="text-green-500" />
            </div>
            
            <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-gray-600 mb-6">
              Your order has been confirmed and is being prepared. You can check the order status on the admin dashboard.
            </p>
            
            {sessionId && (
              <div className="mb-8 py-4 bg-gray-50 rounded">
                <p className="text-sm text-gray-500">Order Reference:</p>
                <p className="font-mono text-sm truncate">{sessionId}</p>
              </div>
            )}
            
            <div className="flex flex-col space-y-3">
              <Button onClick={() => navigate("/home")}>
                Return to Home
              </Button>
              <Button variant="outline" onClick={() => navigate("/menu")}>
                Order More Food
              </Button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
