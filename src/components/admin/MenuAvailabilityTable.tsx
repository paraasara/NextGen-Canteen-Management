
import React from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { RefreshCw } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DatabaseMenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category_id?: string;
  available: boolean;
  categories?: { name: string };
}

interface MenuAvailabilityTableProps {
  menuItems: DatabaseMenuItem[];
  loading: boolean;
  onToggleAvailability: (itemId: string, currentAvailability: boolean) => void;
  onRefresh: () => void;
}

const MenuAvailabilityTable: React.FC<MenuAvailabilityTableProps> = ({
  menuItems,
  loading,
  onToggleAvailability,
  onRefresh,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Menu Item Availability</h2>
        <Button onClick={onRefresh} variant="outline" size="sm" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Available</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {menuItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                  No menu items found
                </TableCell>
              </TableRow>
            ) : (
              menuItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {item.description || 'No description'}
                  </TableCell>
                  <TableCell>₹{item.price}</TableCell>
                  <TableCell>
                    {item.categories?.name || 'Uncategorized'}
                  </TableCell>
                  <TableCell>
                    <span 
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.available 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {item.available ? 'Available' : 'Unavailable'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={item.available}
                      onCheckedChange={() => onToggleAvailability(item.id, item.available)}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default MenuAvailabilityTable;
