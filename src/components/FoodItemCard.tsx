
import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { MenuItem } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface FoodItemCardProps {
  item: MenuItem;
}

const FoodItemCard: React.FC<FoodItemCardProps> = ({ item }) => {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.log(
      `Image failed to load for ${item.name}: ${item.image}`
    );
    if (e.currentTarget.src !== window.location.origin + "/placeholder.svg") {
      e.currentTarget.src = "/placeholder.svg";
      toast({
        title: "Menu image missing",
        description: `No image found for "${item.name}". Check the menu item’s image path or spelling in the database.`,
        variant: "destructive",
      });
    }
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.log(
      `Image loaded successfully for ${item.name}: ${item.image}`
    );
  };

  React.useEffect(() => {
    // Debug: log every menu item's name and image path
    console.log(`[MenuCard render] ${item.name}: ${item.image}`);
    if (
      !item.image ||
      item.image === "/placeholder.svg" ||
      item.image.trim() === ""
    ) {
      toast({
        title: "Missing image",
        description: `Menu item "${item.name}" is using the placeholder image.`,
        variant: "destructive",
      });
    }
  }, [item.name, item.image, toast]);

  const categoryName = item.categories?.name || item.category;

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md">
      <div className="relative">
        <img
          src={item.image || "/placeholder.svg"}
          alt={item.name}
          className="w-full h-48 object-cover"
          onError={handleImageError}
          onLoad={handleImageLoad}
          loading="lazy"
        />
        {item.popular && (
          <span className="absolute top-2 left-2 bg-yellow-400 text-black text-xs font-medium px-2 py-1 rounded-full">
            Popular
          </span>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-lg">{item.name}</h3>
          <span className="font-medium text-lg">₹{item.price}</span>
        </div>
        
        <p className="text-sm text-gray-600 mt-1 mb-3 line-clamp-2">
          {item.description}
        </p>
        
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-gray-500 capitalize">{categoryName}</span>
          <Button 
            onClick={() => addToCart(item)} 
            variant="default" 
            size="sm" 
            className="bg-red-600 hover:bg-red-700 flex items-center"
          >
            <Plus size={16} className="mr-1" /> Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FoodItemCard;

