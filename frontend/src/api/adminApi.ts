import api from './client';
import {
  AdminDashboard,
  ApiResponse,
  BulkDemand,
  BulkPurchase,
  ResidentDashboard,
  Resident,
  SavingsReport,
} from '../types';

export const getAdminDashboard = async (): Promise<ApiResponse<AdminDashboard>> => {
  const response = await api.get<ApiResponse<AdminDashboard>>('/admin/dashboard');
  return response.data;
};

export const getResidentDashboard = async (): Promise<ApiResponse<ResidentDashboard>> => {
  const response = await api.get<ApiResponse<ResidentDashboard>>('/resident/dashboard');
  return response.data;
};

export const getBulkDemand = async (): Promise<ApiResponse<BulkDemand[]>> => {
  const response = await api.get<ApiResponse<BulkDemand[]>>('/admin/bulk-demand');
  return response.data;
};

export const getSavings = async (): Promise<ApiResponse<SavingsReport>> => {
  const response = await api.get<ApiResponse<SavingsReport>>('/admin/savings');
  return response.data;
};

export const getResidents = async (): Promise<ApiResponse<Resident[]>> => {
  const response = await api.get<ApiResponse<Resident[]>>('/admin/residents');
  return response.data;
};

export interface CreateBulkPurchaseInput {
  productId: number;
  totalQuantity: number;
  wholesalePrice: number;
  purchaseStatus?: 'PLANNED' | 'ORDERED' | 'RECEIVED';
}

export const createBulkPurchase = async (
  data: CreateBulkPurchaseInput
): Promise<ApiResponse<BulkPurchase>> => {
  const response = await api.post<ApiResponse<BulkPurchase>>('/admin/bulk-purchases', data);
  return response.data;
};

export const getBulkPurchases = async (): Promise<ApiResponse<BulkPurchase[]>> => {
  const response = await api.get<ApiResponse<BulkPurchase[]>>('/admin/bulk-purchases');
  return response.data;
};

export const updateBulkPurchaseStatus = async (
  id: number,
  status: 'PLANNED' | 'ORDERED' | 'RECEIVED' | string
): Promise<ApiResponse<BulkPurchase>> => {
  const response = await api.patch<ApiResponse<BulkPurchase>>(
    `/admin/bulk-purchases/${id}/status`,
    {
      status,
      purchaseStatus: status,
    }
  );
  return response.data;
};

export default {
  getAdminDashboard,
  getResidentDashboard,
  getBulkDemand,
  getSavings,
  createBulkPurchase,
  getBulkPurchases,
  updateBulkPurchaseStatus,
};
