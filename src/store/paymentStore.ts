import { create } from 'zustand';
import { paymentService, type PaymentIntent } from '../services';

interface PaymentState {
  paymentIntent: PaymentIntent | null;
  paymentHistory: PaymentIntent[];
  isLoading: boolean;
  error: string | null;

  createPaymentIntent: (categoryId: string, amount: number) => Promise<PaymentIntent | null>;
  confirmPayment: (paymentIntentId: string) => Promise<boolean>;
  fetchPaymentHistory: () => Promise<void>;
  clearError: () => void;
}

export const usePaymentStore = create<PaymentState>((set) => ({
  paymentIntent: null,
  paymentHistory: [],
  isLoading: false,
  error: null,

  createPaymentIntent: async (categoryId: string, amount: number) => {
    try {
      set({ isLoading: true, error: null });
      const paymentIntent = await paymentService.createPaymentIntent({
        categoryId,
        amount,
        currency: 'GEL',
      });
      set({ paymentIntent, isLoading: false });
      return paymentIntent;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'შეცდომა გადახდის ინიციალიზაციისას',
      });
      return null;
    }
  },

  confirmPayment: async (paymentIntentId: string) => {
    try {
      set({ isLoading: true, error: null });
      const result = await paymentService.confirmPayment(paymentIntentId);
      set({ isLoading: false });
      return result.success;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'შეცდომა გადახდის დადასტურებისას',
      });
      return false;
    }
  },

  fetchPaymentHistory: async () => {
    try {
      set({ isLoading: true, error: null });
      const history = await paymentService.getPaymentHistory();
      set({ paymentHistory: history, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'შეცდომა გადახდების ისტორიის ჩატვირთვისას',
      });
    }
  },

  clearError: () => set({ error: null }),
}));
