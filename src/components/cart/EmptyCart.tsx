
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const EmptyCart: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="text-center py-12">
      <p className="text-xl text-gray-600">Your cart is empty.</p>
      <Button 
        onClick={() => navigate("/menu")} 
        className="mt-4 bg-red-600 hover:bg-red-700"
      >
        Browse Menu
      </Button>
    </div>
  );
};

export default EmptyCart;
