
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { CheckCircle, XCircle, Clock, RefreshCw, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface OrderManagementProps {
  onOrderUpdate?: () => void;
}

const OrderManagement: React.FC<OrderManagementProps> = ({ onOrderUpdate }) => {
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [acceptedOrders, setAcceptedOrders] = useState<any[]>([]);
  const [deliveredOrders, setDeliveredOrders] = useState<any[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadOrdersFromDatabase = async () => {
    try {
      console.log('=== LOADING ORDERS FROM DATABASE ===');
      setLoading(true);
      
      // Fetch all orders from Supabase
      const { data: dbOrders, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders from database:', error);
        // Fallback to localStorage if database fails
        loadOrdersFromLocalStorage();
        return;
      }

      console.log('Fetched orders from database:', dbOrders);

      // Also get orders from localStorage for backward compatibility
      const localPending = JSON.parse(localStorage.getItem('pending_orders') || '[]');
      const localAccepted = JSON.parse(localStorage.getItem('accepted_orders') || '[]');
      const localDelivered = JSON.parse(localStorage.getItem('delivered_orders') || '[]');

      // Combine database orders with localStorage orders
      const allPending = [
        ...localPending,
        ...(dbOrders?.filter(order => order.status === 'pending') || []).map(order => ({
          order_id: `db_${order.id}`,
          db_order_id: order.id,
          user_email: 'Database Order',
          user_id: order.user_id,
          items: order.items || [],
          amount: order.amount,
          pickup_time: order.pickup_time || 'ASAP',
          timestamp: order.created_at,
          notes: order.notes || '',
          status: order.status
        }))
      ];

      const allAccepted = [
        ...localAccepted,
        ...(dbOrders?.filter(order => order.status === 'accepted') || []).map(order => ({
          order_id: `db_${order.id}`,
          db_order_id: order.id,
          user_email: 'Database Order',
          user_id: order.user_id,
          items: order.items || [],
          amount: order.amount,
          pickup_time: order.pickup_time || 'ASAP',
          timestamp: order.created_at,
          acceptedAt: order.updated_at,
          notes: order.notes || '',
          status: order.status
        }))
      ];

      const allDelivered = [
        ...localDelivered,
        ...(dbOrders?.filter(order => order.status === 'delivered' || order.status === 'completed') || []).map(order => ({
          order_id: `db_${order.id}`,
          db_order_id: order.id,
          user_email: 'Database Order',
          user_id: order.user_id,
          items: order.items || [],
          amount: order.amount,
          pickup_time: order.pickup_time || 'ASAP',
          timestamp: order.created_at,
          deliveredAt: order.updated_at,
          notes: order.notes || '',
          status: order.status
        }))
      ];

      console.log('Combined orders:', { 
        pending: allPending.length, 
        accepted: allAccepted.length, 
        delivered: allDelivered.length 
      });
      
      setPendingOrders(allPending);
      setAcceptedOrders(allAccepted);
      setDeliveredOrders(allDelivered);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Error loading orders from database:', error);
      // Fallback to localStorage
      loadOrdersFromLocalStorage();
    }
  };

  const loadOrdersFromLocalStorage = () => {
    try {
      console.log('=== FALLBACK: LOADING ORDERS FROM LOCALSTORAGE ===');
      const pending = JSON.parse(localStorage.getItem('pending_orders') || '[]');
      const accepted = JSON.parse(localStorage.getItem('accepted_orders') || '[]');
      const delivered = JSON.parse(localStorage.getItem('delivered_orders') || '[]');
      
      console.log('Loaded orders from localStorage:', { 
        pending: pending.length, 
        accepted: accepted.length, 
        delivered: delivered.length 
      });
      
      setPendingOrders(pending);
      setAcceptedOrders(accepted);
      setDeliveredOrders(delivered);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Error loading orders from localStorage:', error);
      setLoading(false);
    }
  };

  // Load orders on component mount
  useEffect(() => {
    loadOrdersFromDatabase();
  }, []);

  // Set up real-time updates with faster refresh rate
  useEffect(() => {
    const interval = setInterval(() => {
      loadOrdersFromDatabase();
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Set up real-time subscription to database changes
  useEffect(() => {
    const channel = supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          console.log('Database change detected, reloading orders...');
          loadOrdersFromDatabase();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Listen for localStorage changes for backward compatibility
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'pending_orders' || e.key === 'accepted_orders' || e.key === 'delivered_orders') {
        console.log('OrderManagement: Storage changed, reloading orders...');
        loadOrdersFromDatabase();
        if (onOrderUpdate) onOrderUpdate();
      }
    };

    const handleOrderUpdate = (e) => {
      console.log('OrderManagement: Custom order update event received:', e.detail);
      loadOrdersFromDatabase();
      if (onOrderUpdate) onOrderUpdate();
    };

    const handleForceRefresh = (e) => {
      console.log('OrderManagement: Force refresh event received:', e.detail);
      loadOrdersFromDatabase();
      if (onOrderUpdate) onOrderUpdate();
    };

    // Listen for broadcast channel messages
    const channel = new BroadcastChannel('order_updates');
    const handleBroadcastMessage = (event) => {
      console.log('OrderManagement: Broadcast message received:', event.data);
      if (event.data.type === 'NEW_ORDER') {
        loadOrdersFromDatabase();
        if (onOrderUpdate) onOrderUpdate();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('orderUpdate', handleOrderUpdate);
    window.addEventListener('forceAdminRefresh', handleForceRefresh);
    channel.addEventListener('message', handleBroadcastMessage);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('orderUpdate', handleOrderUpdate);
      window.removeEventListener('forceAdminRefresh', handleForceRefresh);
      channel.removeEventListener('message', handleBroadcastMessage);
      channel.close();
    };
  }, [onOrderUpdate]);

  const handleAcceptOrder = async (orderId: string) => {
    try {
      console.log('=== ACCEPTING ORDER ===', orderId);

      // Check if it's a database order
      if (orderId.startsWith('db_')) {
        const dbOrderId = orderId.replace('db_', '');
        const { error } = await supabase
          .from('orders')
          .update({ status: 'accepted', updated_at: new Date().toISOString() })
          .eq('id', dbOrderId);

        if (error) {
          console.error('Error updating order in database:', error);
          throw error;
        }

        toast({
          title: "Order Accepted",
          description: `Order ${orderId.substring(0, 8)}... has been accepted.`,
        });

        // Reload orders from database
        loadOrdersFromDatabase();
        if (onOrderUpdate) onOrderUpdate();
        return;
      }

      // Handle localStorage orders (backward compatibility)
      const orderToAccept = pendingOrders.find(order => order.order_id === orderId);
      if (!orderToAccept) return;

      // Update in database if it has a db_order_id
      if (orderToAccept.db_order_id) {
        try {
          const { error } = await supabase
            .from('orders')
            .update({ status: 'accepted', updated_at: new Date().toISOString() })
            .eq('id', orderToAccept.db_order_id);

          if (error) {
            console.error('Error updating order in database:', error);
          } else {
            console.log('Order updated in database successfully');
          }
        } catch (error) {
          console.error('Database update failed:', error);
        }
      }

      // Update localStorage
      const updatedPending = pendingOrders.filter(order => order.order_id !== orderId);
      const updatedAccepted = [...acceptedOrders, { 
        ...orderToAccept, 
        status: 'accepted', 
        acceptedAt: new Date().toISOString() 
      }];

      setPendingOrders(updatedPending);
      setAcceptedOrders(updatedAccepted);
      localStorage.setItem('pending_orders', JSON.stringify(updatedPending));
      localStorage.setItem('accepted_orders', JSON.stringify(updatedAccepted));

      toast({
        title: "Order Accepted",
        description: `Order ${orderId.substring(0, 8)}... has been accepted.`,
      });

      if (onOrderUpdate) onOrderUpdate();
    } catch (error) {
      console.error('Error accepting order:', error);
      toast({
        title: "Error",
        description: "Failed to accept order",
        variant: "destructive",
      });
    }
  };

  const handleMarkDelivered = async (orderId: string) => {
    try {
      console.log('=== MARKING ORDER AS DELIVERED ===', orderId);

      // Check if it's a database order
      if (orderId.startsWith('db_')) {
        const dbOrderId = orderId.replace('db_', '');
        const { error } = await supabase
          .from('orders')
          .update({ status: 'delivered', updated_at: new Date().toISOString() })
          .eq('id', dbOrderId);

        if (error) {
          console.error('Error updating order in database:', error);
          throw error;
        }

        toast({
          title: "Order Delivered",
          description: `Order ${orderId.substring(0, 8)}... has been marked as delivered.`,
        });

        // Reload orders from database
        loadOrdersFromDatabase();
        if (onOrderUpdate) onOrderUpdate();
        return;
      }

      // Handle localStorage orders (backward compatibility)
      const orderToDeliver = acceptedOrders.find(order => order.order_id === orderId);
      if (!orderToDeliver) return;

      // Update in database if it has a db_order_id
      if (orderToDeliver.db_order_id) {
        try {
          const { error } = await supabase
            .from('orders')
            .update({ status: 'delivered', updated_at: new Date().toISOString() })
            .eq('id', orderToDeliver.db_order_id);

          if (error) {
            console.error('Error updating order in database:', error);
          } else {
            console.log('Order marked as delivered in database');
          }
        } catch (error) {
          console.error('Database update failed:', error);
        }
      }

      // Update localStorage
      const updatedAccepted = acceptedOrders.filter(order => order.order_id !== orderId);
      const updatedDelivered = [...deliveredOrders, { 
        ...orderToDeliver, 
        status: 'delivered', 
        deliveredAt: new Date().toISOString() 
      }];

      setAcceptedOrders(updatedAccepted);
      setDeliveredOrders(updatedDelivered);
      localStorage.setItem('accepted_orders', JSON.stringify(updatedAccepted));
      localStorage.setItem('delivered_orders', JSON.stringify(updatedDelivered));

      toast({
        title: "Order Delivered",
        description: `Order ${orderId.substring(0, 8)}... has been marked as delivered.`,
      });

      if (onOrderUpdate) onOrderUpdate();
    } catch (error) {
      console.error('Error marking order as delivered:', error);
      toast({
        title: "Error",
        description: "Failed to mark order as delivered",
        variant: "destructive",
      });
    }
  };

  const handleDeleteOrder = async (orderId: string, fromStatus: 'pending' | 'accepted') => {
    try {
      console.log('=== DELETING ORDER ===', orderId, 'from', fromStatus);

      // Check if it's a database order
      if (orderId.startsWith('db_')) {
        const dbOrderId = orderId.replace('db_', '');
        const { error } = await supabase
          .from('orders')
          .update({ status: 'cancelled', updated_at: new Date().toISOString() })
          .eq('id', dbOrderId);

        if (error) {
          console.error('Error updating order in database:', error);
          throw error;
        }

        toast({
          title: "Order Cancelled",
          description: `Order ${orderId.substring(0, 8)}... has been cancelled.`,
          variant: "destructive",
        });

        // Reload orders from database
        loadOrdersFromDatabase();
        if (onOrderUpdate) onOrderUpdate();
        return;
      }

      // Handle localStorage orders (backward compatibility)
      const orderToDelete = fromStatus === 'pending' 
        ? pendingOrders.find(order => order.order_id === orderId)
        : acceptedOrders.find(order => order.order_id === orderId);

      // Update in database if it has a db_order_id
      if (orderToDelete?.db_order_id) {
        try {
          const { error } = await supabase
            .from('orders')
            .update({ status: 'cancelled', updated_at: new Date().toISOString() })
            .eq('id', orderToDelete.db_order_id);

          if (error) {
            console.error('Error updating order in database:', error);
          } else {
            console.log('Order cancelled in database');
          }
        } catch (error) {
          console.error('Database update failed:', error);
        }
      }

      // Update localStorage
      if (fromStatus === 'pending') {
        const updatedPending = pendingOrders.filter(order => order.order_id !== orderId);
        setPendingOrders(updatedPending);
        localStorage.setItem('pending_orders', JSON.stringify(updatedPending));
      } else {
        const updatedAccepted = acceptedOrders.filter(order => order.order_id !== orderId);
        setAcceptedOrders(updatedAccepted);
        localStorage.setItem('accepted_orders', JSON.stringify(updatedAccepted));
      }

      toast({
        title: "Order Deleted",
        description: `Order ${orderId.substring(0, 8)}... has been deleted.`,
        variant: "destructive",
      });

      if (onOrderUpdate) onOrderUpdate();
    } catch (error) {
      console.error('Error deleting order:', error);
      toast({
        title: "Error",
        description: "Failed to delete order",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatItems = (items: any[]) => {
    if (!Array.isArray(items)) return 'No items';
    return items.map(item => `${item.name} x${item.quantity}`).join(', ');
  };

  const OrderTable = ({ orders, status, actions }: { orders: any[], status: string, actions: (orderId: string) => React.ReactNode }) => (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                No {status} orders
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
              <TableRow key={order.order_id}>
                <TableCell className="font-medium">
                  {order.order_id.substring(0, 12)}...
                </TableCell>
                <TableCell>{order.user_email}</TableCell>
                <TableCell className="max-w-xs truncate">
                  {formatItems(order.items)}
                </TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(order.amount)}
                </TableCell>
                <TableCell className="text-sm">
                  {formatDate(order.timestamp)}
                </TableCell>
                <TableCell>
                  {actions(order.order_id)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-red-600 mr-2" />
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Cross-Device Order Management System</h3>
          <p className="text-sm text-gray-500">
            Last updated: {lastUpdate.toLocaleTimeString()} • Auto-refresh every 5 seconds • Database + localStorage
          </p>
        </div>
        <Button onClick={loadOrdersFromDatabase} variant="outline" size="sm" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Now
        </Button>
      </div>

      {/* Pending Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-500" />
            Pending Orders ({pendingOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <OrderTable 
            orders={pendingOrders} 
            status="pending"
            actions={(orderId) => (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleAcceptOrder(orderId)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteOrder(orderId, 'pending')}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      {/* Accepted Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Accepted Orders ({acceptedOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <OrderTable 
            orders={acceptedOrders} 
            status="accepted"
            actions={(orderId) => (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleMarkDelivered(orderId)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Package className="h-4 w-4 mr-1" />
                  Mark Delivered
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteOrder(orderId, 'accepted')}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      {/* Delivered Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-500" />
            Delivered Orders ({deliveredOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <OrderTable 
            orders={deliveredOrders} 
            status="delivered"
            actions={() => (
              <Badge variant="outline" className="text-green-600">
                Completed
              </Badge>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderManagement;
