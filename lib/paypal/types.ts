/**
 * PayPal Types and Interfaces
 * 
 * Type definitions for PayPal orders and payment data
 */

/**
 * Voucher order data for PayPal integration
 */
export interface VoucherOrderData {
  amount: number;
  currency?: string;
  voucherType?: string;
  description?: string;
}

/**
 * PayPal order creation response
 */
export interface PayPalOrderResponse {
  id: string;
  status: string;
  links?: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

/**
 * PayPal order capture response
 */
export interface PayPalCaptureResponse {
  id: string;
  status: string;
  purchase_units?: Array<{
    reference_id?: string;
    payments?: {
      captures?: Array<{
        id: string;
        status: string;
        amount?: {
          currency_code: string;
          value: string;
        };
      }>;
    };
  }>;
}

/**
 * Error response structure
 */
export interface PayPalErrorResponse {
  error: string;
  details?: string;
}


