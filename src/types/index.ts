
export interface MenuItem {
  id: string | number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  popular?: boolean;
  available?: boolean;
  categories?: any; // For the relation with categories table
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Category {
  id: string;
  name: string;
}

export interface Order {
  id: number;
  items: CartItem[];
  total: number;
  status: 'Pending' | 'Completed' | 'Cancelled';
  createdAt: string;
  pickupTime?: string;
}
