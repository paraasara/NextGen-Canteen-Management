
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MyOrders = () => {
  const { authState } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      if (!authState.user) {
        setOrders([]);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', authState.user.id)
        .order('created_at', { ascending: false });
      if (error) {
        setOrders([]);
      } else {
        setOrders(data || []);
      }
      setLoading(false);
    };

    fetchOrders();

    // Optionally: set up a polling or re-fetch when page gets visible

    // Clean up: none
  }, [authState.user]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow container px-4 py-8 mx-auto">
        <h1 className="text-2xl font-bold mb-6">My Orders</h1>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-red-600 mr-2" />
            <span>Loading your orders...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center text-gray-500 py-16">
            You have no orders yet.
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <Card key={order.id}>
                <CardHeader>
                  <CardTitle>
                    Order #{order.id?.slice?.(0, 8)}...
                    <Badge
                      className="ml-2"
                      variant={
                        order.status === "completed"
                          ? "default"
                          : order.status === "accepted"
                          ? "outline"
                          : order.status === "pending"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {order.status || "pending"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    <div>
                      <span className="font-medium">Placed on: </span>
                      {formatDate(order.created_at)}
                    </div>
                    <div>
                      <span className="font-medium">Pickup time:</span>{" "}
                      {order.pickup_time || "ASAP"}
                    </div>
                    <div>
                      <span className="font-medium">Amount:</span>{" "}
                      ₹{order.amount}
                    </div>
                    <div>
                      <span className="font-medium">Items:</span>{" "}
                      {Array.isArray(order.items)
                        ? order.items.map(
                            (item: any) =>
                              `${item.name} ×${item.quantity}`
                          ).join(", ")
                        : ""}
                    </div>
                    {order.notes && (
                      <div className="mt-2">
                        <div className="font-semibold text-red-700">Admin Message:</div>
                        <div className="bg-red-50 rounded px-3 py-1 text-sm text-gray-800">
                          {order.notes}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MyOrders;
