import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { menuItems } from "@/data/menuUpdated";

const Admin = () => {
  const navigate = useNavigate();
  const { authState, profile } = useAuth();
  const { toast } = useToast();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch payment-integrated order data from Supabase
  useEffect(() => {
    if (!authState.loading && authState.user) {
      fetchOrders();
    }
  }, [authState.loading, authState.user]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      console.error("Failed to fetch orders:", error);
      toast({
        title: "Error",
        description:
          "Could not fetch order/payment data for admin dashboard. " +
          (error.message || "Unknown error."),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Admin access checks
  useEffect(() => {
    if (!authState.loading) {
      if (!authState.user) {
        toast({
          title: "Access denied",
          description: "You need to log in to access this page.",
          variant: "destructive",
        });
        navigate("/login");
      } else if (profile && profile.role !== "admin") {
        toast({
          title: "Access denied",
          description: "You do not have permission to access this page.",
          variant: "destructive",
        });
        navigate("/");
      }
    }
  }, [authState.loading, authState.user, profile, navigate, toast]);

  // Helper functions for stats
  const todayString = new Date().toISOString().split("T")[0];
  const totalOrdersToday = orders.filter(order =>
    (order.created_at || "").startsWith(todayString)
  ).length;

  const pendingOrders = orders.filter(order => (order.status || "").toLowerCase() === "pending");
  const completedOrders = orders.filter(order => (order.status || "").toLowerCase() === "completed");
  const todayRevenue = orders
    .filter(
      order =>
        (order.status || "").toLowerCase() === "completed" &&
        (order.updated_at || "").startsWith(todayString)
    )
    .reduce((sum, order) => sum + (Number(order.amount) || 0), 0);

  // Simplified update status for admin (Works with actual DB orders)
  const updateOrderStatus = async (orderId: string, status: "Pending" | "Completed" | "Cancelled") => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", orderId);
      if (error) throw error;
      setOrders(orders =>
        orders.map(order =>
          order.id === orderId ? { ...order, status, updated_at: new Date().toISOString() } : order
        )
      );
      toast({
        title: "Success",
        description: `Order status updated to ${status}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update order status: " + (error.message || "Unknown error"),
        variant: "destructive",
      });
    }
  };

  if (authState.loading || !authState.user || !profile || profile.role !== "admin") {
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
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Total Orders Today
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{totalOrdersToday}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Pending Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {pendingOrders.length}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Today's Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  ₹{todayRevenue}
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="current">
            <TabsList>
              <TabsTrigger value="current">Current Orders</TabsTrigger>
              <TabsTrigger value="menu">Manage Menu</TabsTrigger>
            </TabsList>

            <TabsContent value="current">
              <Card>
                <CardHeader>
                  <CardTitle>Student Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                      <p className="ml-2">Loading orders...</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Items</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Total (₹)</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Pick-up Time</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.length > 0 ? (
                          orders.map((order) => {
                            let itemsArr: {name: string, quantity: number}[] = [];
                            try {
                              itemsArr = Array.isArray(order.items)
                                ? order.items
                                : (typeof order.items === "string"
                                    ? JSON.parse(order.items)
                                    : []);
                            } catch {
                              itemsArr = [];
                            }
                            return (
                              <TableRow key={order.id}>
                                <TableCell title={order.id}>{order.id?.substring(0, 8)}...</TableCell>
                                <TableCell>
                                  {itemsArr.map(item => item.name).join(", ")}
                                </TableCell>
                                <TableCell>
                                  {itemsArr.reduce((sum, item) => sum + (item.quantity || 0), 0)}
                                </TableCell>
                                <TableCell>
                                  ₹{order.amount}
                                </TableCell>
                                <TableCell>
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      (order.status || "").toLowerCase() === "pending"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : (order.status || "").toLowerCase() === "completed"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {order.status}
                                  </span>
                                </TableCell>
                                <TableCell>{order.pickup_time || "N/A"}</TableCell>
                                <TableCell>
                                  {(order.status || "").toLowerCase() === "pending" ? (
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        onClick={() => updateOrderStatus(order.id, "Completed")}
                                        className="bg-green-600 hover:bg-green-700"
                                      >
                                        Complete
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => updateOrderStatus(order.id, "Cancelled")}
                                        className="text-red-600 border-red-600 hover:bg-red-50"
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  ) : (
                                    <span className="text-sm text-gray-500">
                                      {order.status === "Completed" ? "Completed" : "Cancelled"}
                                    </span>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                              No orders found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="menu">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Menu Items</CardTitle>
                  <Button>Add New Item</Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Popular</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {menuItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.id}</TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell className="capitalize">{item.category}</TableCell>
                          <TableCell>₹{item.price}</TableCell>
                          <TableCell>
                            {item.popular ? (
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                Yes
                              </span>
                            ) : (
                              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                                No
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                Edit
                              </Button>
                              <Button size="sm" variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;
