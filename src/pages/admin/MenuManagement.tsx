
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import MenuAvailabilityTable from "@/components/admin/MenuAvailabilityTable";
import AdminAuthGuard from "@/components/admin/AdminAuthGuard";

interface DatabaseMenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category_id?: string;
  available: boolean;
  categories?: { name: string };
}

const MenuManagement = () => {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [menuItems, setMenuItems] = useState<DatabaseMenuItem[]>([]);

  // Simplified admin check - just use email for now to avoid profile issues
  const isAuthorizedAdmin = authState.user && ['admin@gmail.com', 'chinmayir30@gmail.com'].includes(authState.user.email || '');

  useEffect(() => {
    // Check admin authentication
    if (!authState.loading) {
      if (!authState.user) {
        toast({
          title: "Access denied",
          description: "You need to log in to access this page.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }
      
      if (!isAuthorizedAdmin) {
        toast({
          title: "Access denied",
          description: "Only administrators can access this page.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }
      
      fetchMenuItems();
    }
  }, [authState.loading, authState.user, isAuthorizedAdmin, navigate, toast]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      console.log("Fetching menu items for admin...");
      
      // First try to fetch without categories to isolate the issue
      const { data: itemsData, error: itemsError } = await supabase
        .from('menu_items')
        .select('*')
        .order('name');

      if (itemsError) {
        console.error("Error fetching menu items:", itemsError);
        console.error("Full error details:", JSON.stringify(itemsError, null, 2));
        throw itemsError;
      }

      console.log("Menu items fetched successfully:", itemsData?.length || 0, "items");

      // Then try to fetch categories separately
      let categoriesData: { [key: string]: string } = {};
      try {
        const { data: cats, error: catsError } = await supabase
          .from('categories')
          .select('id, name');

        if (catsError) {
          console.warn("Error fetching categories:", catsError);
          console.warn("Full categories error details:", JSON.stringify(catsError, null, 2));
        } else {
          categoriesData = cats?.reduce((acc, cat) => {
            acc[cat.id] = cat.name;
            return acc;
          }, {} as { [key: string]: string }) || {};
        }
      } catch (catError) {
        console.warn("Categories fetch failed:", catError);
        console.warn("Categories exception details:", JSON.stringify(catError, null, 2));
      }

      // Combine the data
      const formattedItems: DatabaseMenuItem[] = (itemsData || []).map(item => ({
        ...item,
        categories: item.category_id ? { name: categoriesData[item.category_id] || 'Uncategorized' } : undefined
      }));

      setMenuItems(formattedItems);
      console.log("Menu items processed successfully:", formattedItems.length);
    } catch (error) {
      console.error("Error in fetchMenuItems:", error);
      console.error("Full error object:", JSON.stringify(error, null, 2));
      console.error("Error message:", error instanceof Error ? error.message : 'Unknown error type');
      console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
      
      let errorMessage = 'Unknown error';
      if (error && typeof error === 'object') {
        if ('message' in error && typeof error.message === 'string') {
          errorMessage = error.message;
        } else if ('details' in error && typeof error.details === 'string') {
          errorMessage = error.details;
        } else if ('hint' in error && typeof error.hint === 'string') {
          errorMessage = error.hint;
        } else {
          errorMessage = JSON.stringify(error);
        }
      }
      
      toast({
        title: "Error",
        description: `Failed to load menu items: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async (itemId: string, currentAvailability: boolean) => {
    try {
      console.log(`Toggling availability for item ${itemId} from ${currentAvailability} to ${!currentAvailability}`);
      
      const { error } = await supabase
        .from('menu_items')
        .update({ available: !currentAvailability })
        .eq('id', itemId);

      if (error) {
        console.error("Error updating item availability:", error);
        console.error("Full update error details:", JSON.stringify(error, null, 2));
        throw error;
      }

      // Update local state
      setMenuItems(items =>
        items.map(item =>
          item.id === itemId
            ? { ...item, available: !currentAvailability }
            : item
        )
      );

      toast({
        title: "Success",
        description: `Item ${!currentAvailability ? 'enabled' : 'disabled'} successfully`,
      });
      
      console.log(`Successfully toggled availability for item ${itemId}`);
    } catch (error) {
      console.error("Error updating item availability:", error);
      console.error("Full toggle error object:", JSON.stringify(error, null, 2));
      
      let errorMessage = 'Unknown error';
      if (error && typeof error === 'object') {
        if ('message' in error && typeof error.message === 'string') {
          errorMessage = error.message;
        } else if ('details' in error && typeof error.details === 'string') {
          errorMessage = error.details;
        } else if ('hint' in error && typeof error.hint === 'string') {
          errorMessage = error.hint;
        } else {
          errorMessage = JSON.stringify(error);
        }
      }
      
      toast({
        title: "Error",
        description: `Failed to update item availability: ${errorMessage}`,
        variant: "destructive",
      });
    }
  };

  if (authState.loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-red-600 mr-2" />
          <p>Loading...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <AdminAuthGuard isAuthorized={isAuthorizedAdmin}>
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Menu Management</h1>
            
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-red-600 mr-2" />
                <p>Loading menu items...</p>
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Menu Item Availability</CardTitle>
                </CardHeader>
                <CardContent>
                  <MenuAvailabilityTable
                    menuItems={menuItems}
                    loading={loading}
                    onToggleAvailability={toggleAvailability}
                    onRefresh={fetchMenuItems}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </AdminAuthGuard>
      </main>
      
      <Footer />
    </div>
  );
};

export default MenuManagement;
