
import React from "react";
import { Button } from "@/components/ui/button";
import CartItem from "@/components/CartItem";
import { useCart } from "@/contexts/CartContext";

const CartItemsList: React.FC = () => {
  const { cartItems, clearCart } = useCart();

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="font-semibold text-xl mb-4">Cart Items</h2>
      <div className="space-y-4">
        {cartItems.map((item) => (
          <CartItem key={item.id} item={item} />
        ))}
      </div>
      
      <div className="flex justify-end mt-6">
        <Button 
          variant="outline" 
          onClick={clearCart}
          className="text-red-600 border-red-600 hover:bg-red-50"
        >
          Clear Cart
        </Button>
      </div>
    </div>
  );
};

export default CartItemsList;
