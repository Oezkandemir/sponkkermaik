#!/bin/bash

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║     PayPal Credentials Setup for 'sponk' App                 ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Step-by-Step Instructions:"
echo ""
echo "1. Open this URL in your browser:"
echo "   👉 https://developer.paypal.com/dashboard/applications/sandbox"
echo ""
echo "2. Find and click on the 'sponk' app in the list"
echo ""
echo "3. You will see the credentials:"
echo ""
echo "   ┌─────────────────────────────────────────────────┐"
echo "   │ Client ID                                 [📋]  │"
echo "   │ ASijpKf7fy27xZExKwQzW69_k2-0i8eJe...            │"
echo "   │                                                  │"
echo "   │ Secret                              [Show] [📋] │"
echo "   │ ••••••••••••••••••••••••                        │"
echo "   └─────────────────────────────────────────────────┘"
echo ""
echo "4. Click the [📋] button next to Client ID to copy it"
echo "5. Click [Show] next to Secret, then click [📋] to copy"
echo ""
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Now, let's update your credentials..."
echo ""
echo "Paste your Client ID (from the 'sponk' app):"
read -r CLIENT_ID

echo ""
echo "Paste your Client Secret (from the 'sponk' app):"
read -r CLIENT_SECRET

echo ""
echo "🔄 Updating .env.local file..."

# Backup
cp .env.local .env.local.backup-$(date +%Y%m%d-%H%M%S)

# Update credentials
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  sed -i '' "s|^PAYPAL_CLIENT_ID=.*|PAYPAL_CLIENT_ID=${CLIENT_ID}|" .env.local
  sed -i '' "s|^PAYPAL_CLIENT_SECRET=.*|PAYPAL_CLIENT_SECRET=${CLIENT_SECRET}|" .env.local
else
  # Linux
  sed -i "s|^PAYPAL_CLIENT_ID=.*|PAYPAL_CLIENT_ID=${CLIENT_ID}|" .env.local
  sed -i "s|^PAYPAL_CLIENT_SECRET=.*|PAYPAL_CLIENT_SECRET=${CLIENT_SECRET}|" .env.local
fi

echo "✅ Credentials updated!"
echo ""
echo "🧪 Testing credentials..."
echo ""

# Test the credentials
export PAYPAL_CLIENT_ID="${CLIENT_ID}"
export PAYPAL_CLIENT_SECRET="${CLIENT_SECRET}"
export PAYPAL_API_URL="https://api-m.sandbox.paypal.com"

# Run the test
node test-paypal-credentials.mjs

if [ $? -eq 0 ]; then
  echo ""
  echo "╔═══════════════════════════════════════════════════════════════╗"
  echo "║                    ✅ SUCCESS!                                ║"
  echo "║                                                               ║"
  echo "║  Your PayPal credentials are working correctly!               ║"
  echo "║                                                               ║"
  echo "║  Next steps:                                                  ║"
  echo "║  1. Restart your dev server: pnpm dev                         ║"
  echo "║  2. Try the PayPal checkout again                             ║"
  echo "╚═══════════════════════════════════════════════════════════════╝"
  echo ""
else
  echo ""
  echo "╔═══════════════════════════════════════════════════════════════╗"
  echo "║                    ❌ ERROR                                   ║"
  echo "║                                                               ║"
  echo "║  The credentials don't match. Please:                         ║"
  echo "║  1. Go back to PayPal Dashboard                               ║"
  echo "║  2. Make sure you're on the SANDBOX tab                       ║"
  echo "║  3. Click on the 'sponk' app                                  ║"
  echo "║  4. Copy BOTH credentials using the copy buttons              ║"
  echo "║  5. Run this script again                                     ║"
  echo "╚═══════════════════════════════════════════════════════════════╝"
  echo ""
fi


