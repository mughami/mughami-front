import apiClient from './client';

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed';
  clientSecret: string;
}

export interface PaymentRequest {
  categoryId: string;
  amount: number;
  currency: string;
}

const paymentService = {
  createPaymentIntent: async (data: PaymentRequest): Promise<PaymentIntent> => {
    const response = await apiClient.post<PaymentIntent>('/payments/create-intent', data);
    return response.data;
  },

  confirmPayment: async (paymentIntentId: string): Promise<{ success: boolean }> => {
    const response = await apiClient.post<{ success: boolean }>('/payments/confirm', {
      paymentIntentId,
    });
    return response.data;
  },

  getPaymentHistory: async (): Promise<PaymentIntent[]> => {
    const response = await apiClient.get<PaymentIntent[]>('/payments/history');
    return response.data;
  },
};

export default paymentService;
