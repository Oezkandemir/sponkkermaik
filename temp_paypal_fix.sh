#!/bin/bash
echo "🔧 PayPal Credential Updater"
echo ""
echo "Please enter your PayPal Client ID (from the dashboard):"
read CLIENT_ID
echo ""
echo "Please enter your PayPal Client Secret (click 'Show' in dashboard first):"
read CLIENT_SECRET
echo ""

# Backup current .env.local
cp .env.local .env.local.backup

# Update the credentials
sed -i.bak "s|^PAYPAL_CLIENT_ID=.*|PAYPAL_CLIENT_ID=${CLIENT_ID}|" .env.local
sed -i.bak "s|^PAYPAL_CLIENT_SECRET=.*|PAYPAL_CLIENT_SECRET=${CLIENT_SECRET}|" .env.local

echo "✅ Credentials updated in .env.local"
echo ""
echo "🧪 Testing credentials..."
echo ""

# Test the credentials
export PAYPAL_CLIENT_ID="${CLIENT_ID}"
export PAYPAL_CLIENT_SECRET="${CLIENT_SECRET}"
export PAYPAL_API_URL="https://api-m.sandbox.paypal.com"

node test-paypal-credentials.mjs
