export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'store_owner';
  tenant_id: string | null;
}

export interface Tenant {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
}

export interface Category {
  id: string;
  tenant_id: string;
  name: string;
}

export interface Product {
  id: string;
  tenant_id: string;
  category_id?: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  image_url?: string;
  created_at: string;
  categories?: { name: string };
}

export interface OrderLineItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  tenant_id: string;
  customer_email: string;
  status: 'pending' | 'paid' | 'shipped' | 'cancelled';
  total: number;
  line_items: OrderLineItem[];
  created_at: string;
}

export interface Overview {
  total_revenue: number;
  total_orders: number;
  paid_orders?: number;
  total_products: number;
  total_tenants?: number;
  total_users?: number;
  low_stock_alerts?: number;
}

export interface RevenuePoint {
  date: string;
  revenue: number;
}
