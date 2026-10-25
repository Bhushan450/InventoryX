import api from './client';
import { ApiResponse, Order } from '../types';

export interface RazorpayOrder {
  orderId: number;
  paymentStatus: Order['paymentStatus'];
  orderStatus: Order['orderStatus'];
  gatewayOrderId: string;
  keyId: string;
  amount: number;
  currency: string;
  message: string;
}

export interface PaymentConfirmation {
  orderId: number;
  paymentStatus: Order['paymentStatus'];
  orderStatus: Order['orderStatus'];
  gatewayOrderId?: string;
  message: string;
}

export interface RazorpayCheckoutResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export const createRazorpayOrder = async (orderId: number): Promise<ApiResponse<RazorpayOrder>> => {
  const response = await api.post<ApiResponse<RazorpayOrder>>(
    `/orders/${orderId}/payment/order`
  );
  return response.data;
};

export const verifyRazorpayPayment = async (
  orderId: number,
  payment: RazorpayCheckoutResponse
): Promise<ApiResponse<PaymentConfirmation>> => {
  const response = await api.post<ApiResponse<PaymentConfirmation>>(
    `/orders/${orderId}/payment/verify`,
    {
      razorpayOrderId: payment.razorpay_order_id,
      razorpayPaymentId: payment.razorpay_payment_id,
      razorpaySignature: payment.razorpay_signature,
    }
  );
  return response.data;
};

export const getPaymentStatus = async (
  orderId: number
): Promise<ApiResponse<PaymentConfirmation>> => {
  const response = await api.get<ApiResponse<PaymentConfirmation>>(
    `/orders/${orderId}/payment-status`
  );
  return response.data;
};

export default {
  createRazorpayOrder,
  verifyRazorpayPayment,
  getPaymentStatus,
};
