declare global {
  interface Window {
    Cashfree?: (opts: { mode: "sandbox" | "production" }) => {
      checkout: (opts: {
        paymentSessionId: string;
        returnUrl?: string;
      }) => Promise<{
        error?: unknown;
        redirect?: boolean;
        paymentDetails?: { paymentMessage?: string; [key: string]: unknown };
      }>;
    };
  }
}

export {};
