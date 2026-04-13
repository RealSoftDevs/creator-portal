declare module 'razorpay' {
  interface RazorpayOrder {
    id: string;
    entity: string;
    amount: number;
    amount_paid: number;
    amount_due: number;
    currency: string;
    receipt: string;
    status: string;
    attempts: number;
    notes: any;
    created_at: number;
  }

  interface RazorpayOptions {
    amount: number;
    currency: string;
    receipt: string;
    notes?: any;
  }

  class Razorpay {
    constructor(options: { key_id: string; key_secret: string });
    orders: {
      create(options: RazorpayOptions): Promise<RazorpayOrder>;
    };
  }

  export = Razorpay;
}