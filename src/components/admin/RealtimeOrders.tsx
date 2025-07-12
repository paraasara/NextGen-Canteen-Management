
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
import { CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";

interface RealtimeOrdersProps {
  onOrderUpdate?: () => void;
}

const RealtimeOrders: React.FC<RealtimeOrdersProps> = ({ onOrderUpdate }) => {
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [acceptedOrders, setAcceptedOrders] = useState<any[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const { toast } = useToast();

  const loadOrders = () => {
    try {
      const pending = JSON.parse(localStorage.getItem('pending_orders') || '[]');
      const accepted = JSON.parse(localStorage.getItem('accepted_orders') || '[]');
      
      setPendingOrders(pending);
      setAcceptedOrders(accepted);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  // Load orders on component mount
  useEffect(() => {
    loadOrders();
  }, []);

  // Set up real-time updates every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadOrders();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Listen for localStorage changes (real-time sync)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'pending_orders' || e.key === 'accepted_orders') {
        loadOrders();
        if (onOrderUpdate) onOrderUpdate();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [onOrderUpdate]);

  const handleAcceptOrder = (orderId: string) => {
    try {
      const orderToAccept = pendingOrders.find(order => order.order_id === orderId);
      if (!orderToAccept) return;

      // Move from pending to accepted
      const updatedPending = pendingOrders.filter(order => order.order_id !== orderId);
      const updatedAccepted = [...acceptedOrders, { ...orderToAccept, status: 'accepted', acceptedAt: new Date().toISOString() }];

      setPendingOrders(updatedPending);
      setAcceptedOrders(updatedAccepted);

      // Update localStorage
      localStorage.setItem('pending_orders', JSON.stringify(updatedPending));
      localStorage.setItem('accepted_orders', JSON.stringify(updatedAccepted));

      // Trigger storage event for real-time sync
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'pending_orders',
        newValue: JSON.stringify(updatedPending)
      }));

      toast({
        title: "Order Accepted",
        description: `Order ${orderId.substring(0, 8)}... has been accepted and user notified.`,
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

  const handleDeleteOrder = (orderId: string) => {
    try {
      // Remove from pending orders
      const updatedPending = pendingOrders.filter(order => order.order_id !== orderId);
      setPendingOrders(updatedPending);

      // Update localStorage
      localStorage.setItem('pending_orders', JSON.stringify(updatedPending));

      // Trigger storage event for real-time sync
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'pending_orders',
        newValue: JSON.stringify(updatedPending)
      }));

      toast({
        title: "Order Deleted",
        description: `Order ${orderId.substring(0, 8)}... has been deleted and user notified.`,
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

  return (
    <div className="space-y-6">
      {/* Header with refresh */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Real-time Order Management</h3>
          <p className="text-sm text-gray-500">
            Last updated: {lastUpdate.toLocaleTimeString()} • Auto-refresh every 10 seconds
          </p>
        </div>
        <Button onClick={loadOrders} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
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
          {pendingOrders.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No pending orders</p>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Pickup Time</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingOrders.map((order) => (
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
                      <TableCell>
                        <Badge variant="outline">{order.pickup_time}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(order.timestamp)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAcceptOrder(order.order_id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteOrder(order.order_id)}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
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
          {acceptedOrders.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No accepted orders</p>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Pickup Time</TableHead>
                    <TableHead>Accepted At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {acceptedOrders.map((order) => (
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
                      <TableCell>
                        <Badge variant="outline">{order.pickup_time}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(order.acceptedAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RealtimeOrders;
