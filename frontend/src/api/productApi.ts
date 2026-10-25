import api from './client';
import { ApiResponse, Product } from '../types';

export const getProducts = async (): Promise<ApiResponse<Product[]>> => {
  const response = await api.get<ApiResponse<Product[]>>('/products');
  return response.data;
};

export const getAdminProducts = async (): Promise<ApiResponse<Product[]>> => {
  const response = await api.get<ApiResponse<Product[]>>('/admin/products');
  return response.data;
};

export const getProduct = async (id: number): Promise<ApiResponse<Product>> => {
  const response = await api.get<ApiResponse<Product>>(`/products/${id}`);
  return response.data;
};

export const createProduct = async (
  data: Omit<Product, 'id'>
): Promise<ApiResponse<Product>> => {
  const response = await api.post<ApiResponse<Product>>('/admin/products', data);
  return response.data;
};

export const updateProduct = async (
  id: number,
  data: Partial<Product>
): Promise<ApiResponse<Product>> => {
  const response = await api.put<ApiResponse<Product>>(`/admin/products/${id}`, data);
  return response.data;
};

export const deleteProduct = async (id: number): Promise<ApiResponse<null>> => {
  const response = await api.delete<ApiResponse<null>>(`/admin/products/${id}`);
  return response.data;
};

export default {
  getProducts,
  getAdminProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
