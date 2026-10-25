export interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'RESIDENT';
  flatNumber: string;
}

export interface AuthResponse {
  token: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'RESIDENT';
  flatNumber?: string;
  id?: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  unit: string;
  retailPrice: number;
  wholesalePrice: number;
  available: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  unit: string;
}

export interface Order {
  id: number;
  userId: number;
  userName: string;
  totalAmount: number;
  paymentStatus: 'PENDING' | 'SUCCESS' | 'FAILED';
  orderStatus: 'PENDING_PAYMENT' | 'PAID' | 'ORDERED' | 'READY' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  items: OrderItem[];
}

export interface BulkDemand {
  productId: number;
  productName: string;
  unit: string;
  totalQuantity: number;
  retailPrice: number;
  wholesalePrice: number;
  estimatedRetailCost: number;
  estimatedWholesaleCost: number;
}

export interface SavingsItem {
  productId: number;
  productName: string;
  unit: string;
  totalQuantity: number;
  retailPrice: number;
  wholesalePrice: number;
  totalSavings: number;
}

export interface SavingsReport {
  totalRetailCost: number;
  totalWholesaleCost: number;
  totalSavings: number;
  items: SavingsItem[];
}

export interface Resident {
  id: number;
  name: string;
  email: string;
  flatNumber: string;
  createdAt: string;
}

export interface BulkPurchase {
  id: number;
  productId: number;
  productName: string;
  unit: string;
  totalQuantity: number;
  wholesalePrice: number;
  totalCost: number;
  purchaseStatus: 'PLANNED' | 'ORDERED' | 'RECEIVED';
  createdAt: string;
}

export interface AdminDashboard {
  totalResidents: number;
  totalProducts: number;
  totalOrders: number;
  paidOrders: number;
  totalCollected: number;
  estimatedSavings: number;
}

export interface ResidentDashboard {
  recentOrders: Order[];
  pendingPayments: number;
  totalSpent: number;
  estimatedSavings: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}
