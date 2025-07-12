
import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onStatusChange: (status: string) => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  isOpen,
  onClose,
  order,
  onStatusChange,
}) => {
  const [notes, setNotes] = useState(order.notes || "");
  const [status, setStatus] = useState(order.status);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Order notes updated successfully",
      });
      
      // Close the modal
      onClose();
    } catch (error) {
      console.error("Error updating order:", error);
      toast({
        title: "Error",
        description: "Failed to update order notes",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Parse items from JSONB
  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Order ID</Label>
            <div className="col-span-3 font-medium">{order.id}</div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Created</Label>
            <div className="col-span-3">{formatDate(order.created_at)}</div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Amount</Label>
            <div className="col-span-3 font-medium">{formatCurrency(order.amount || 0)}</div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Pickup Time</Label>
            <div className="col-span-3">{order.pickup_time || 'Not specified'}</div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Status</Label>
            <div className="col-span-3">
              <Select 
                value={status} 
                onValueChange={setStatus}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">Items</Label>
            <div className="col-span-3">
              <ul className="list-disc pl-5 space-y-1">
                {items.map((item: any, index: number) => (
                  <li key={index}>
                    {item.name} - {formatCurrency(item.price)} x {item.quantity} = {formatCurrency(item.price * item.quantity)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="notes" className="text-right pt-2">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="col-span-3"
              rows={3}
              placeholder="Add notes about this order..."
            />
          </div>
        </div>
        
        <DialogFooter className="flex justify-between">
          <div>
            {order.status === 'Pending' && (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => onStatusChange('Cancelled')}
                  className="mr-2 text-red-600 border-red-600 hover:bg-red-50"
                >
                  Cancel Order
                </Button>
                <Button 
                  onClick={() => onStatusChange('Completed')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Mark as Completed
                </Button>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaving || notes === order.notes}
            >
              {isSaving ? "Saving..." : "Save Notes"}
            </Button>
            {status !== order.status && (
              <Button 
                onClick={() => onStatusChange(status)}
                className="bg-canteen hover:bg-canteen/90"
              >
                Update Status
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsModal;
