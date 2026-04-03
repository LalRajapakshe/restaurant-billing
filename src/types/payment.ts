export interface Payment {
  id: string;
  billId: string;
  amount: number;
  method: 'cash' | 'card' | 'upi';
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt?: Date;
}

export interface PaymentGatewayResponse {
  success: boolean;
  transactionId?: string;
  message: string;
}
