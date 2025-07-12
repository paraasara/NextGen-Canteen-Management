import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FoodItemCard from "@/components/FoodItemCard";
import CategoryFilter from "@/components/CategoryFilter";
import { MenuItem } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const Menu = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMenuItems = async () => {
    try {
      console.log("Fetching menu items from database...");
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          *,
          categories (
            name
          )
        `)
        .eq('available', true)
        .order('price', { ascending: true }); // Order by price in ascending order

      if (error) {
        console.error("Database error:", error);
        toast({
          title: "Error",
          description: "Failed to load menu items from database",
          variant: "destructive",
        });
        return;
      }

      console.log("Menu items fetched successfully:", data);
      const formattedItems: MenuItem[] = data.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || "",
        price: parseFloat(item.price.toString()),
        category: item.categories?.name || "Other",
        image: item.image || "/placeholder.svg",
        popular: item.popular || false,
        available: item.available
      }));

      setMenuItems(formattedItems);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      toast({
        title: "Error",
        description: "Failed to load menu items",
        variant: "destructive",
      });
    }
  };

  const fetchCategories = async () => {
    try {
      console.log("Fetching categories from database...");
      const { data, error } = await supabase
        .from('categories')
        .select('name');

      if (error) {
        console.error("Database error:", error);
        toast({
          title: "Error",
          description: "Failed to load categories from database",
          variant: "destructive",
        });
        return;
      }

      console.log("Categories fetched successfully:", data);
      const categoryObjects = [
        { id: "all", name: "All" },
        ...data.map(cat => ({ 
          id: cat.name.toLowerCase(), 
          name: cat.name 
        }))
      ];
      setCategories(categoryObjects);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchMenuItems(), fetchCategories()]);
      setLoading(false);
    };
    
    loadData();
  }, []);

  
  // Sort filtered items by price in ascending order
  const filteredItems = selectedCategory === "all" 
    ? menuItems 
    : menuItems.filter(item => item.category.toLowerCase() === selectedCategory);

  // Sort the filtered items by price to maintain price order
  const sortedFilteredItems = [...filteredItems].sort((a, b) => a.price - b.price);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-red-600 mr-2" />
          <p>Loading menu...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-center mb-8">Our Menu</h1>
          
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
            {sortedFilteredItems.map((item) => (
              <FoodItemCard key={item.id} item={item} />
            ))}
          </div>
          
          {sortedFilteredItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No items available in this category at the moment.</p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Menu;
