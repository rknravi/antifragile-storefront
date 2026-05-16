declare global {
  interface Window {
    Razorpay?: new (options: RazorpayConstructorOptions) => { open: () => void };
  }
}

export interface RazorpayConstructorOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id?: string;
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
  }) => void;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
}

export {};
