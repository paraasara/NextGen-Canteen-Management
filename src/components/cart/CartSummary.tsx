
import React from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

interface CartSummaryProps {
  pickupTime: string;
  canProceedToPayment: boolean;
  onCheckout: () => void;
}

const CartSummary: React.FC<CartSummaryProps> = ({
  pickupTime,
  canProceedToPayment,
  onCheckout
}) => {
  const { subtotal, isPlacingOrder, minimumOrderAmount, canPlaceOrder } = useCart();
  const { authState } = useAuth();

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="font-semibold text-xl mb-4">Cart Summary</h2>
      
      <div className="space-y-3 mb-4">
        <div className="flex justify-between text-gray-600">
          <span>Cart Subtotal</span>
          <span>₹{subtotal}</span>
        </div>
        
        <div className="border-t pt-3 flex justify-between font-semibold text-lg">
          <span>Total</span>
          <span>₹{subtotal}</span>
        </div>
      </div>

      {!canPlaceOrder && (
        <Alert className="mb-4 border-amber-200 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            Minimum order amount is ₹{minimumOrderAmount}. 
            Add ₹{minimumOrderAmount - subtotal} more to place order.
          </AlertDescription>
        </Alert>
      )}

      {!pickupTime && canPlaceOrder && (
        <Alert className="mb-4 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Please select a pickup time to continue with payment.
          </AlertDescription>
        </Alert>
      )}
      
      <Button 
        className={`w-full my-3 transition-all duration-300 ${
          canProceedToPayment 
            ? "bg-red-600 hover:bg-red-700 opacity-100" 
            : "bg-gray-400 cursor-not-allowed opacity-50"
        }`}
        onClick={onCheckout}
        disabled={isPlacingOrder || !canProceedToPayment}
      >
        {isPlacingOrder ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Pay Online"
        )}
      </Button>
      
      {!authState.user && (
        <p className="text-sm text-center text-red-600 mt-2">
          Please log in to place an order
        </p>
      )}
    </div>
  );
};

export default CartSummary;
