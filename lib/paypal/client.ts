/**
 * PayPal Client Configuration
 * 
 * This module initializes and configures the PayPal SDK client
 * for handling payment operations.
 * 
 * Environment Variables Required:
 * - NEXT_PUBLIC_PAYPAL_CLIENT_ID: PayPal Client ID
 * - PAYPAL_CLIENT_SECRET: PayPal Client Secret
 * - PAYPAL_ENVIRONMENT: 'sandbox' or 'live'
 */

import { PayPalClient } from "@paypal/paypal-server-sdk";

/**
 * Gets the PayPal environment configuration
 * 
 * Returns:
 *   'sandbox' for testing or 'production' for live payments
 */
function getPayPalEnvironment(): 'sandbox' | 'production' {
  const env = process.env.PAYPAL_ENVIRONMENT || 'sandbox';
  return env === 'live' ? 'production' : 'sandbox';
}

/**
 * Creates and configures a PayPal client instance
 * 
 * Returns:
 *   PayPalClient: Configured PayPal client for API operations
 */
export function createPayPalClient(): PayPalClient {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      'PayPal credentials are not configured. Please set NEXT_PUBLIC_PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in your .env.local file'
    );
  }

  const environment = getPayPalEnvironment();

  return new PayPalClient({
    clientCredentialsAuth: {
      oAuthClientId: clientId,
      oAuthClientSecret: clientSecret,
    },
    environment,
    logging: {
      logLevel: 'info',
      logRequest: { logBody: true },
      logResponse: { logHeaders: true },
    },
  });
}

/**
 * Singleton instance of PayPal client
 */
export const paypalClient = createPayPalClient();


