
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OrderManagement from "@/components/admin/OrderManagement";
import MenuItemsTable from "@/components/admin/MenuItemsTable";
import { Loader2, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const navigate = useNavigate();
  const { authState, isAdmin, loading: authLoading, profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isAuthorizedAdmin, setIsAuthorizedAdmin] = useState(false);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    todayRevenue: 0,
  });

  // Check if user is authorized admin (either by profile role or email)
  useEffect(() => {
    if (!authLoading && authState.user) {
      const adminEmails = ['admin@gmail.com', 'chinmayir30@gmail.com'];
      const isEmailAdmin = adminEmails.includes(authState.user.email || '');
      const isProfileAdmin = profile?.role === 'admin';
      
      console.log('Admin check:', {
        userEmail: authState.user.email,
        isEmailAdmin,
        isProfileAdmin,
        profileRole: profile?.role
      });
      
      setIsAuthorizedAdmin(isEmailAdmin || isProfileAdmin);
    }
  }, [authLoading, authState.user, profile]);

  useEffect(() => {
    // Check admin authentication
    if (!authLoading) {
      if (!authState.user) {
        toast({
          title: "Access denied",
          description: "You need to log in to access this page.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }
      
      // Wait for admin authorization check to complete
      if (!isAuthorizedAdmin && authState.user) {
        const adminEmails = ['admin@gmail.com', 'chinmayir30@gmail.com'];
        const isEmailAdmin = adminEmails.includes(authState.user.email || '');
        
        if (!isEmailAdmin && profile && profile.role !== 'admin') {
          toast({
            title: "Access denied",
            description: "Only administrators can access this page.",
            variant: "destructive",
          });
          navigate("/");
          return;
        }
      }
      
      // If user is authorized, fetch dashboard stats
      if (isAuthorizedAdmin || (authState.user && ['admin@gmail.com', 'chinmayir30@gmail.com'].includes(authState.user.email || ''))) {
        fetchDashboardStats();
      }
    }
  }, [authLoading, authState.user, isAuthorizedAdmin, profile, navigate, toast]);

  const fetchDashboardStats = async () => {
    try {
      console.log('Fetching dashboard stats from database...');
      setLoading(true);
      
      // Get stats from database first
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      let databaseStats = {
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        todayRevenue: 0,
      };

      if (!error && orders) {
        console.log('Database orders:', orders);
        
        const today = new Date().toISOString().split('T')[0];
        
        databaseStats = {
          totalOrders: orders.length,
          pendingOrders: orders.filter(order => order.status === 'pending').length,
          completedOrders: orders.filter(order => order.status === 'completed' || order.status === 'delivered').length,
          todayRevenue: orders
            .filter(order => 
              (order.status === 'completed' || order.status === 'delivered') && 
              order.updated_at && 
              order.updated_at.startsWith(today)
            )
            .reduce((sum, order) => sum + (Number(order.amount) || 0), 0),
        };
      } else {
        console.error('Database error:', error);
      }

      // Also get stats from localStorage for backward compatibility
      const pendingOrders = JSON.parse(localStorage.getItem('pending_orders') || '[]');
      const acceptedOrders = JSON.parse(localStorage.getItem('accepted_orders') || '[]');
      const deliveredOrders = JSON.parse(localStorage.getItem('delivered_orders') || '[]');

      const localStorageStats = {
        totalOrders: pendingOrders.length + acceptedOrders.length + deliveredOrders.length,
        pendingOrders: pendingOrders.length,
        completedOrders: deliveredOrders.length,
        todayRevenue: deliveredOrders.reduce((sum: number, order: any) => sum + (Number(order.amount) || 0), 0),
      };

      console.log('Database stats:', databaseStats);
      console.log('LocalStorage stats:', localStorageStats);

      // Combine both sources for comprehensive statistics
      const combinedStats = {
        totalOrders: databaseStats.totalOrders + localStorageStats.totalOrders,
        pendingOrders: databaseStats.pendingOrders + localStorageStats.pendingOrders,
        completedOrders: databaseStats.completedOrders + localStorageStats.completedOrders,
        todayRevenue: databaseStats.todayRevenue + localStorageStats.todayRevenue,
      };

      console.log('Combined stats:', combinedStats);
      setStats(combinedStats);
      setLastRefresh(new Date());
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard statistics",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleManualRefresh = () => {
    setLoading(true);
    fetchDashboardStats();
  };

  // Set up real-time updates for dashboard stats
  useEffect(() => {
    if (!isAuthorizedAdmin && !['admin@gmail.com', 'chinmayir30@gmail.com'].includes(authState.user?.email || '')) {
      return;
    }

    // Set up real-time subscription to database changes
    const channel = supabase
      .channel('dashboard-orders-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          console.log('Database change detected, refreshing dashboard stats...');
          fetchDashboardStats();
        }
      )
      .subscribe();

    // Also listen to localStorage changes for backward compatibility
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'pending_orders' || e.key === 'accepted_orders' || e.key === 'delivered_orders') {
        console.log('Dashboard: Storage changed, refreshing stats...');
        fetchDashboardStats();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isAuthorizedAdmin, authState.user]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-red-600 mr-2" />
          <p>Loading dashboard...</p>
        </div>
        <Footer />
      </div>
    );
  }

  // Check if user is not logged in or not an admin
  if (!authState.user || (!isAuthorizedAdmin && authState.user && !['admin@gmail.com', 'chinmayir30@gmail.com'].includes(authState.user.email || ''))) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center p-4">
          <Alert variant="destructive" className="max-w-md">
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              Only administrators can access this page.
              Please <a href="/" className="underline">login</a> with admin credentials.
            </AlertDescription>
          </Alert>
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
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                Last updated: {lastRefresh.toLocaleTimeString()} • Cross-device sync enabled
              </div>
              <Button onClick={handleManualRefresh} variant="outline" size="sm" disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-red-600 mr-2" />
              <p>Loading statistics...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">
                      Total Orders
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{stats.totalOrders}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">
                      Pending Orders
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-yellow-600">{stats.pendingOrders}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">
                      Completed Orders
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-green-600">{stats.completedOrders}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">
                      Today's Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">₹{stats.todayRevenue}</p>
                  </CardContent>
                </Card>
              </div>
              
              <Tabs defaultValue="orders" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="orders">Cross-Device Order Management</TabsTrigger>
                  <TabsTrigger value="menu">Menu Management</TabsTrigger>
                </TabsList>
                
                <TabsContent value="orders" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Live Orders - Works Across All Devices</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <OrderManagement onOrderUpdate={fetchDashboardStats} />
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="menu" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Menu Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <MenuItemsTable />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
