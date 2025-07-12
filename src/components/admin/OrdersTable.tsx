
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
import { Loader2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import OrderDetailsModal from "./OrderDetailsModal";
import { formatCurrency } from "@/lib/utils";

interface OrdersTableProps {
  onOrderUpdate?: () => void;
}

const OrdersTable: React.FC<OrdersTableProps> = ({ onOrderUpdate }) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log("Fetched orders:", data);
      setOrders(data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Order status updated to ${status}`,
      });

      // Update local state and trigger parent callback
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status } : order
      ));
      
      if (onOrderUpdate) onOrderUpdate();
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const filteredOrders = orders.filter(order => {
    // Filter by status
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    // Filter by search (in JSON items)
    let matchesSearch = true;
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      
      // Search in items (which is a JSONB field)
      if (order.items) {
        const items = Array.isArray(order.items) ? order.items : [];
        matchesSearch = items.some((item: any) => 
          item.name?.toLowerCase().includes(searchLower)
        );
        
        // Also check if order id includes search query
        if (!matchesSearch) {
          matchesSearch = order.id.toLowerCase().includes(searchLower);
        }
      }
    }
    
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select 
          value={statusFilter} 
          onValueChange={setStatusFilter}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-canteen" />
          <p className="ml-2">Loading orders...</p>
        </div>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Pickup Time</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => {
                  // Parse items from JSONB
                  const items = Array.isArray(order.items) ? order.items : [];
                  const itemsText = items
                    .map((item: any) => `${item.name} (${item.quantity})`)
                    .join(", ");
                  
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id.substring(0, 8)}...</TableCell>
                      <TableCell className="max-w-xs truncate" title={itemsText}>
                        {itemsText}
                      </TableCell>
                      <TableCell>{formatCurrency(order.amount || 0)}</TableCell>
                      <TableCell>{order.pickup_time || 'Not specified'}</TableCell>
                      <TableCell>{formatDate(order.created_at)}</TableCell>
                      <TableCell>
                        <span 
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === "Pending" 
                              ? "bg-yellow-100 text-yellow-800" 
                              : order.status === "Completed" 
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewOrder(order)}
                          >
                            View Details
                          </Button>
                          {order.status === "Pending" && (
                            <>
                              <Button 
                                size="sm" 
                                onClick={() => handleUpdateOrderStatus(order.id, "Completed")}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Complete
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleUpdateOrderStatus(order.id, "Cancelled")}
                                className="text-red-600 border-red-600 hover:bg-red-50"
                              >
                                Cancel
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}
      
      {selectedOrder && (
        <OrderDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          order={selectedOrder}
          onStatusChange={(status) => {
            handleUpdateOrderStatus(selectedOrder.id, status);
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default OrdersTable;
