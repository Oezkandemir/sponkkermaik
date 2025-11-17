/**
 * PayPal Credentials Test Script
 * 
 * Run this to verify your PayPal credentials are working correctly
 * Usage: node test-paypal-credentials.mjs
 */

// Load environment variables
const clientId = process.env.PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
const apiUrl = process.env.PAYPAL_API_URL || "https://api-m.sandbox.paypal.com";

console.log("\n🔍 Testing PayPal Credentials...\n");

// Check if credentials exist
if (!clientId || clientId === "your-paypal-client-id-here") {
  console.error("❌ PAYPAL_CLIENT_ID is not set or still has placeholder value");
  console.log("\n📝 To fix:");
  console.log("1. Go to: https://developer.paypal.com/dashboard/");
  console.log("2. Navigate to 'Apps & Credentials'");
  console.log("3. Select 'Sandbox' tab");
  console.log("4. Copy your Client ID");
  console.log("5. Update PAYPAL_CLIENT_ID in .env.local\n");
  process.exit(1);
}

if (!clientSecret || clientSecret === "your-paypal-client-secret-here") {
  console.error("❌ PAYPAL_CLIENT_SECRET is not set or still has placeholder value");
  console.log("\n📝 To fix:");
  console.log("1. Go to: https://developer.paypal.com/dashboard/");
  console.log("2. Navigate to 'Apps & Credentials'");
  console.log("3. Select 'Sandbox' tab");
  console.log("4. Click 'Show' under Secret");
  console.log("5. Copy your Secret");
  console.log("6. Update PAYPAL_CLIENT_SECRET in .env.local\n");
  process.exit(1);
}

console.log("✅ Client ID found:", clientId.substring(0, 20) + "...");
console.log("✅ Client Secret found:", clientSecret.substring(0, 10) + "...");
console.log("🌐 API URL:", apiUrl);
console.log("\n🔄 Testing authentication...\n");

// Test the credentials
const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

try {
  const response = await fetch(`${apiUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await response.json();

  if (response.ok && data.access_token) {
    console.log("✅ SUCCESS! PayPal authentication working!");
    console.log("📝 Token received:", data.access_token.substring(0, 30) + "...");
    console.log("⏰ Token expires in:", data.expires_in, "seconds");
    console.log("\n✨ Your PayPal credentials are configured correctly!\n");
  } else {
    console.error("❌ FAILED! PayPal authentication error:");
    console.error(JSON.stringify(data, null, 2));
    console.log("\n🔍 Common issues:");
    console.log("1. ❌ Client ID and Secret don't match");
    console.log("2. ❌ Using Live credentials with Sandbox URL (or vice versa)");
    console.log("3. ❌ Credentials copied incorrectly (extra spaces, missing characters)");
    console.log("4. ❌ App is disabled in PayPal dashboard");
    console.log("\n📝 To fix:");
    console.log("1. Go to: https://developer.paypal.com/dashboard/");
    console.log("2. Make sure you're on the SANDBOX tab");
    console.log("3. Copy BOTH Client ID and Secret from the SAME app");
    console.log("4. Ensure no extra spaces when pasting\n");
  }
} catch (error) {
  console.error("❌ ERROR:", error.message);
  console.log("\n🔍 Check:");
  console.log("1. Your internet connection");
  console.log("2. The PAYPAL_API_URL is correct");
  console.log("3. PayPal services are operational\n");
}


