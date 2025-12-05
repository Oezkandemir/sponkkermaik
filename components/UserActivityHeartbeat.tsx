"use client";

import { useEffect, useRef } from "react";

/**
 * User Activity Heartbeat Component
 * 
 * Sends periodic heartbeat requests to track user activity.
 * This allows admins to see who is currently online.
 * 
 * Should be included in the root layout or main app component.
 */
export default function UserActivityHeartbeat() {
  const sessionIdRef = useRef<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Generate or retrieve session ID
    // Try localStorage first (persists across sessions), then sessionStorage, then generate new
    if (!sessionIdRef.current) {
      try {
        sessionIdRef.current = 
          localStorage.getItem("user_activity_session_id") ||
          sessionStorage.getItem("user_activity_session_id") ||
          `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Store in both for reliability
        try {
          localStorage.setItem("user_activity_session_id", sessionIdRef.current);
        } catch (e) {
          // localStorage might not be available (private browsing, etc.)
        }
        try {
          sessionStorage.setItem("user_activity_session_id", sessionIdRef.current);
        } catch (e) {
          // sessionStorage might not be available
        }
      } catch (error) {
        // If storage is not available, generate a new ID
        sessionIdRef.current = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        console.warn("Could not access storage, using temporary session ID:", sessionIdRef.current);
      }
    }

    // Send initial heartbeat immediately
    sendHeartbeat();

    // Set up interval to send heartbeat every 30 seconds
    intervalRef.current = setInterval(() => {
      sendHeartbeat();
    }, 30000); // 30 seconds

    // Also send heartbeat when page becomes visible (user comes back to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        sendHeartbeat();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Send heartbeat when page is about to unload
    const handleBeforeUnload = () => {
      // Use sendBeacon for reliability during page unload
      if (navigator.sendBeacon) {
        try {
          navigator.sendBeacon(
            '/api/user-activity/heartbeat',
            JSON.stringify({ sessionId: sessionIdRef.current })
          );
        } catch (e) {
          // Ignore errors during unload
        }
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  /**
   * Sends heartbeat request to server
   */
  const sendHeartbeat = async () => {
    try {
      const response = await fetch("/api/user-activity/heartbeat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Heartbeat failed:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          sessionId: sessionIdRef.current,
        });
      } else {
        const result = await response.json().catch(() => ({}));
        // Log success in development mode only
        if (process.env.NODE_ENV === 'development') {
          console.debug("Heartbeat sent successfully:", {
            sessionId: result.sessionId,
            userId: result.userId,
          });
        }
      }
    } catch (error) {
      // Log errors but don't break the app
      console.error("Heartbeat error:", {
        error,
        sessionId: sessionIdRef.current,
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  // This component doesn't render anything
  return null;
}

