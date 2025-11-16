"use client";

import { useEffect, useRef } from "react";

/**
 * TrustIndex Widget Component
 * Lädt das TrustIndex Review Widget dynamisch auf der Client-Seite
 */
export default function TrustIndexWidget() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Script dynamisch laden und direkt im Container einfügen
    const script = document.createElement("script");
    script.src = "https://cdn.trustindex.io/loader.js?322aec858d1b380d1286b094c24";
    script.defer = true;
    script.async = true;
    
    // Script direkt in den Container einfügen
    containerRef.current.appendChild(script);

    // Cleanup: Script entfernen wenn Component unmountet
    return () => {
      if (containerRef.current && containerRef.current.contains(script)) {
        containerRef.current.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="mt-12 sm:mt-16 max-w-4xl mx-auto">
      {/* TrustIndex Widget Container */}
      <div ref={containerRef} className="trustindex-container"></div>
    </div>
  );
}

