"use client";

import SnowfallLib from "react-snowfall";
import { useEffect, useState } from "react";

/**
 * Snowfall Component
 * Displays orange snowflakes across the page using custom SVG images.
 * Flakes gradually "melt" over time, reducing the total count.
 */
export default function SnowfallEffect() {
  const [snowflakeImages, setSnowflakeImages] = useState<HTMLImageElement[]>([]);
  const [snowflakeCount, setSnowflakeCount] = useState(40); // Start with fewer flakes

  // Create orange snowflake SVG and convert to Image element
  useEffect(() => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 32 32">
        <!-- Main arms -->
        <line x1="16" y1="2" x2="16" y2="8" stroke="#f97316" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="16" y1="24" x2="16" y2="30" stroke="#f97316" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="2" y1="16" x2="8" y2="16" stroke="#f97316" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="24" y1="16" x2="30" y2="16" stroke="#f97316" stroke-width="1.5" stroke-linecap="round"/>
        <!-- Diagonal arms -->
        <line x1="5.66" y1="5.66" x2="9.66" y2="9.66" stroke="#f97316" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="22.34" y1="22.34" x2="26.34" y2="26.34" stroke="#f97316" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="5.66" y1="26.34" x2="9.66" y2="22.34" stroke="#f97316" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="22.34" y1="9.66" x2="26.34" y2="5.66" stroke="#f97316" stroke-width="1.5" stroke-linecap="round"/>
        <!-- Side branches on main arms -->
        <line x1="16" y1="8" x2="14" y2="10" stroke="#f97316" stroke-width="1" stroke-linecap="round"/>
        <line x1="16" y1="8" x2="18" y2="10" stroke="#f97316" stroke-width="1" stroke-linecap="round"/>
        <line x1="16" y1="24" x2="14" y2="22" stroke="#f97316" stroke-width="1" stroke-linecap="round"/>
        <line x1="16" y1="24" x2="18" y2="22" stroke="#f97316" stroke-width="1" stroke-linecap="round"/>
        <line x1="8" y1="16" x2="10" y2="14" stroke="#f97316" stroke-width="1" stroke-linecap="round"/>
        <line x1="8" y1="16" x2="10" y2="18" stroke="#f97316" stroke-width="1" stroke-linecap="round"/>
        <line x1="24" y1="16" x2="22" y2="14" stroke="#f97316" stroke-width="1" stroke-linecap="round"/>
        <line x1="24" y1="16" x2="22" y2="18" stroke="#f97316" stroke-width="1" stroke-linecap="round"/>
        <!-- Center circle -->
        <circle cx="16" cy="16" r="2" fill="#f97316" opacity="0.8"/>
      </svg>
    `;
    
    const dataUrl = `data:image/svg+xml;base64,${btoa(svg)}`;
    const img = new Image();
    img.onload = () => {
      setSnowflakeImages([img]);
    };
    img.src = dataUrl;
  }, []);

  // Gradually reduce snowflake count over time (melting effect)
  useEffect(() => {
    const interval = setInterval(() => {
      setSnowflakeCount((prevCount) => {
        // Reduce by 1-2 flakes every 8-12 seconds, but never go below 15
        const reduction = Math.random() < 0.5 ? 1 : 2;
        return Math.max(15, prevCount - reduction);
      });
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  if (snowflakeImages.length === 0) {
    return null;
  }

  return (
    <SnowfallLib
      snowflakeCount={snowflakeCount}
      speed={[0.3, 1.5]}
      wind={[-0.3, 0.8]}
      radius={[15, 35]}
      rotationSpeed={[-0.5, 0.5]}
      images={snowflakeImages}
      style={{
        position: "fixed",
        width: "100vw",
        height: "100vh",
        zIndex: 1000,
        pointerEvents: "none",
      }}
    />
  );
}

