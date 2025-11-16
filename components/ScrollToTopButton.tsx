"use client";

import { useState, useEffect } from "react";

/**
 * ScrollToTopButton Component
 * Zeigt einen Button rechts unten, wenn der Benutzer scrollt
 * Klick bringt den Benutzer sanft zurück nach oben
 */
export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  // Zeige Button wenn User mehr als 300px gescrollt hat
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Event Listener hinzufügen
    window.addEventListener("scroll", toggleVisibility);

    // Cleanup
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  // Scroll to top funktion
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 bg-amber-700 hover:bg-amber-800 active:bg-amber-900 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 group"
          aria-label="Zurück nach oben"
        >
          {/* Pfeil nach oben Icon */}
          <svg
            className="w-6 h-6 group-hover:-translate-y-1 transition-transform duration-200"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}
    </>
  );
}

