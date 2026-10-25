import api from './client';
import { ApiResponse, Order } from '../types';

export interface CreateOrderItemInput {
  productId: number;
  quantity: number;
}

export const createOrder = async (
  items: CreateOrderItemInput[]
): Promise<ApiResponse<Order>> => {
  const response = await api.post<ApiResponse<Order>>('/orders', { items });
  return response.data;
};

export const getMyOrders = async (): Promise<ApiResponse<Order[]>> => {
  const response = await api.get<ApiResponse<Order[]>>('/orders/my');
  return response.data;
};

export const getOrder = async (id: number): Promise<ApiResponse<Order>> => {
  const response = await api.get<ApiResponse<Order>>(`/orders/${id}`);
  return response.data;
};

export const getAllOrders = async (): Promise<ApiResponse<Order[]>> => {
  const response = await api.get<ApiResponse<Order[]>>('/admin/orders');
  return response.data;
};

export const updateOrderStatus = async (
  id: number,
  status: Order['orderStatus'] | string
): Promise<ApiResponse<Order>> => {
  const response = await api.patch<ApiResponse<Order>>(`/admin/orders/${id}/status`, {
    status,
    orderStatus: status,
  });
  return response.data;
};

export default {
  createOrder,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
};
