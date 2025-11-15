"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { href: "/", label: "Startseite" },
    { href: "/workshops", label: "Workshops" },
    { href: "/atelier", label: "Galerie Atelier" },
    { href: "/galerie-kurswerke", label: "Galerie Kurswerke" },
    { href: "/oeffnungszeiten", label: "Öffnungszeiten" },
    { href: "/anfahrt", label: "Anfahrt" },
    { href: "/kontakt", label: "Kontakt" },
  ];

  return (
    <>
      <header
        className={`bg-white shadow-sm  fixed top-0 left-0 right-0 z-50 border-b border-gray-100 transition-all duration-300 ${
          !isScrolled
            ? "-translate-y-full opacity-0 pointer-events-none"
            : "translate-y-0 opacity-100 pointer-events-auto"
        }`}
      >
        <nav className="container mx-auto px-4 py-0 mt-2 mb-2">
          <div className="flex items-center justify-between leading-none">
            <Link
              href="/"
              className="flex items-center gap-1.5 hover:opacity-90 transition-opacity"
            >
              <img
                src="/images/logo.png?v=2"
                alt="Sponk Keramik Logo"
                className="block m-0 p-0 w-20 h-auto"
                style={{ display: 'block' }}
              />
              <span className="text-black font-bold text-xl leading-none">
                Keramik
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors whitespace-nowrap ${
                    pathname === item.href
                      ? "text-amber-800 bg-amber-50"
                      : "text-gray-700 hover:text-amber-800 hover:bg-amber-50/50"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <button
              className="lg:hidden p-1 text-gray-700 hover:bg-gray-100 rounded transition-colors z-50 relative"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Menü schließen" : "Menü öffnen"}
              aria-expanded={isMenuOpen}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </nav>
      </header>

      {/* Fullscreen Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-white z-[9999] flex items-center justify-center">
          <div className="flex flex-col items-center justify-center gap-6 w-full px-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-8 py-5 text-2xl font-semibold transition-colors w-full text-center rounded-lg ${
                  pathname === item.href
                    ? "text-amber-800 bg-amber-50"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <button
            className="absolute top-6 right-6 p-3 text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Menü schließen"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}
