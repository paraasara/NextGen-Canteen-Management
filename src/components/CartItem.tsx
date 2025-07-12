
import React from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartItem as CartItemType } from "@/types";
import { useCart } from "@/contexts/CartContext";

interface CartItemProps {
  item: CartItemType;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <div className="flex items-center justify-between py-4 border-b last:border-b-0">
      <div className="flex items-center">
        <img
          src={item.image}
          alt={item.name}
          className="w-16 h-16 object-cover rounded-md mr-4"
        />
        <div>
          <h3 className="font-medium">{item.name}</h3>
          <p className="text-sm text-gray-500">₹{item.price} each</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center border rounded-md">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 hover:bg-gray-100"
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
          >
            <Minus size={16} />
          </Button>
          <span className="w-8 text-center">{item.quantity}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 hover:bg-gray-100"
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
          >
            <Plus size={16} />
          </Button>
        </div>

        <span className="font-medium w-16 text-right">
          ₹{item.price * item.quantity}
        </span>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
          onClick={() => removeFromCart(item.id)}
        >
          <Trash2 size={16} />
        </Button>
      </div>
    </div>
  );
};

export default CartItem;
