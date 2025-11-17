#!/usr/bin/env node

/**
 * Advanced PayPal Credentials Debugger
 * Tests credentials with detailed debugging
 */

const clientId = "ASijpKf7fy27xZExKwQzW69_k2-0i8eJeMUS9jYtGj7JBKzLQDZIEpMooGTK12i5L4VbdEEup4DGEH84";
const clientSecret = "EBR_uyyykCXEtRS5N_lpE1HlCGISA_F9SPn8rwM2Q2AgNaMedFZhrCBDf_iDX7D0vTxdwSCTgm_Ztw-z";

console.log("\n🔍 PayPal Credentials Debug Tool\n");
console.log("Client ID:", clientId);
console.log("Client ID length:", clientId.length);
console.log("Client Secret:", clientSecret.substring(0, 20) + "...");
console.log("Client Secret length:", clientSecret.length);
console.log("\n📋 Checking for hidden characters...");
console.log("Client ID has spaces:", /\s/.test(clientId) ? "YES ❌" : "NO ✅");
console.log("Client Secret has spaces:", /\s/.test(clientSecret) ? "YES ❌" : "NO ✅");

const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
console.log("\n🔐 Base64 auth:", auth.substring(0, 50) + "...");

console.log("\n🌐 Testing against PayPal Sandbox API...\n");

// Test with Sandbox
async function testSandbox() {
  try {
    const response = await fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    const data = await response.json();
    console.log("📥 SANDBOX Response Status:", response.status);
    console.log("📥 SANDBOX Response:", JSON.stringify(data, null, 2));

    if (data.access_token) {
      console.log("\n✅ SANDBOX: SUCCESS!");
      return true;
    } else {
      console.log("\n❌ SANDBOX: FAILED!");
      return false;
    }
  } catch (error) {
    console.error("❌ SANDBOX Error:", error.message);
    return false;
  }
}

// Test with Live (just to see if credentials are for live instead)
async function testLive() {
  try {
    const response = await fetch("https://api-m.paypal.com/v1/oauth2/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    const data = await response.json();
    console.log("\n\n📥 LIVE Response Status:", response.status);
    console.log("📥 LIVE Response:", JSON.stringify(data, null, 2));

    if (data.access_token) {
      console.log("\n⚠️  LIVE: SUCCESS! (But you're using sandbox URL in your app!)");
      return true;
    } else {
      console.log("\n❌ LIVE: FAILED!");
      return false;
    }
  } catch (error) {
    console.error("❌ LIVE Error:", error.message);
    return false;
  }
}

const sandboxWorks = await testSandbox();
const liveWorks = await testLive();

console.log("\n");
console.log("═══════════════════════════════════════════════════════");
console.log("RESULTS:");
console.log("═══════════════════════════════════════════════════════");
console.log("Sandbox API:", sandboxWorks ? "✅ WORKS" : "❌ FAILS");
console.log("Live API:", liveWorks ? "✅ WORKS" : "❌ FAILS");
console.log("═══════════════════════════════════════════════════════");

if (!sandboxWorks && !liveWorks) {
  console.log("\n🚨 CRITICAL: Credentials don't work for EITHER sandbox OR live!");
  console.log("\nPossible issues:");
  console.log("1. ❌ App is disabled in PayPal dashboard");
  console.log("2. ❌ Credentials are from a deleted app");
  console.log("3. ❌ Client ID and Secret are from different apps");
  console.log("4. ❌ PayPal account has restrictions");
  console.log("\n💡 Solution: Create a BRAND NEW app in PayPal dashboard");
  console.log("   https://developer.paypal.com/dashboard/applications/sandbox");
  console.log("   Click 'Create App' and get fresh credentials\n");
} else if (liveWorks && !sandboxWorks) {
  console.log("\n⚠️  WARNING: You're using LIVE credentials but your app is set to SANDBOX!");
  console.log("\n💡 Solution: Either:");
  console.log("   1. Switch to sandbox credentials from the SANDBOX tab");
  console.log("   2. OR change PAYPAL_API_URL to https://api-m.paypal.com\n");
} else if (sandboxWorks) {
  console.log("\n✅ All good! Credentials work perfectly!");
}


