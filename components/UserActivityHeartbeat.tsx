"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

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
  const pathname = usePathname();
  const currentPageRef = useRef<string | null>(null);
  const pageStartTimeRef = useRef<number>(Date.now());

  /**
   * Tracks a page visit start
   */
  const trackPageVisit = async () => {
    if (!sessionIdRef.current || !pathname) return;

    try {
      await fetch("/api/user-activity/page-visit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          pagePath: pathname,
          pageTitle: document.title,
          referrer: document.referrer || null,
          action: "start",
        }),
      });
    } catch (error) {
      // Silently fail - tracking failures shouldn't affect user experience
      console.debug("Page visit tracking failed:", error);
    }
  };

  /**
   * Tracks a page visit end
   */
  const trackPageVisitEnd = async (pagePath: string) => {
    if (!sessionIdRef.current) return;

    const duration = Math.floor((Date.now() - pageStartTimeRef.current) / 1000);

    try {
      await fetch("/api/user-activity/page-visit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          pagePath: pagePath,
          pageTitle: document.title,
          action: "end",
          duration: duration,
        }),
      });
    } catch (error) {
      // Silently fail - tracking failures shouldn't affect user experience
      console.debug("Page visit end tracking failed:", error);
    }
  };

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

  // Initialize session and set up heartbeat
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

    // Track initial page visit
    if (pathname) {
      currentPageRef.current = pathname;
      pageStartTimeRef.current = Date.now();
      trackPageVisit();
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
      // Track page visit end before leaving
      if (currentPageRef.current) {
        trackPageVisitEnd(currentPageRef.current);
      }
      
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
  }, []); // Only run once on mount

  // Track page changes
  useEffect(() => {
    if (!pathname || !sessionIdRef.current) return;

    // If page changed, track the previous page visit end
    if (currentPageRef.current && currentPageRef.current !== pathname) {
      trackPageVisitEnd(currentPageRef.current);
    }
    
    // Start tracking new page
    currentPageRef.current = pathname;
    pageStartTimeRef.current = Date.now();
    trackPageVisit();
  }, [pathname]); // Run when pathname changes

  // This component doesn't render anything
  return null;
}

