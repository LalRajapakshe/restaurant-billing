// Application constants
export const APP_NAME = 'Restaurant Billing System';
export const CURRENCY = 'INR';
export const CURRENCY_SYMBOL = '₹';

// API endpoints
export const API_ENDPOINTS = {
  DASHBOARD: '/api/dashboard',
  JOBS: '/api/jobs',
  BILLS: '/api/bills',
  PAYMENTS: '/api/payments',
  ERP_SYNC: '/api/erp/sync',
};

// Status options
export const JOB_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
};
