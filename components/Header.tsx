"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";

const kurswerkeImages = [
  "image00001.jpeg",
  "image00002.jpeg",
  "image00003.jpeg",
  "image00004.jpeg",
  "image00005.jpeg",
  "image00006.jpeg",
  "image00007.jpeg",
  "image00008.jpeg",
  "image00009.jpeg",
  "image00010.jpeg",
  "image00011.png",
  "image00012.jpeg",
  "image00013.jpeg",
  "image00014.jpeg",
  "image00015.jpeg",
  "image00016.jpeg",
  "image00017.jpeg",
  "image00018.jpeg",
  "image00019.jpeg",
  "image00020.jpeg",
  "image00021.jpeg",
  "image00022.jpeg",
  "image00023.jpeg",
  "image00024.jpeg",
  "image00025.jpeg",
  "image00026.jpeg",
  "image00027.jpeg",
  "image00028.jpeg",
  "image00029.jpeg",
  "image00030.jpeg",
  "image00031.jpeg",
  "image00032.jpeg",
  "image00033.jpeg",
  "image00034.jpeg",
  "image00035.jpeg",
  "image00036.jpeg",
  "image00037.jpeg",
  "image00038.jpeg",
  "image00039.jpeg",
  "image00040.jpeg",
];

export default function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuBackgroundImage, setMenuBackgroundImage] = useState<string>("");

  const handleMenuToggle = () => {
    if (!isMenuOpen) {
      // Beim Öffnen: zufälliges Bild auswählen
      const randomImage =
        kurswerkeImages[Math.floor(Math.random() * kurswerkeImages.length)];
      setMenuBackgroundImage(randomImage);
    } else {
      // Beim Schließen: Bild zurücksetzen
      setMenuBackgroundImage("");
    }
    setIsMenuOpen(!isMenuOpen);
  };

  const navItems = [
    { href: "/", label: "Startseite" },
    { href: "/kurse-preise-sponk-keramik", label: "Workshops" },
    { href: "/atelier-bilder-sponk-keramik-dusseldorf", label: "Galerie Atelier" },
    { href: "/galerie-kurswerke", label: "Galerie Kurswerke" },
    { href: "/ueber-uns", label: "Über uns" },
    { href: "/kurse-atelier-zeiten", label: "Öffnungszeiten" },
    { href: "/anfahrt-sponk-keramik-und-kurse-dusseldorf", label: "Anfahrt" },
    { href: "/kontakt-sponk-keramik", label: "Kontakt" },
  ];

  return (
    <>
      <header
        className="bg-white/80 backdrop-blur-md shadow-sm fixed top-0 left-0 right-0 z-50 border-b border-gray-100/50"
      >
        <nav className="container mx-auto px-4 py-6 md:py-4">
          <div className="flex items-center justify-between leading-none">
            <Link
              href="/"
              className="flex items-center gap-1.5 group"
            >
              <Image
                src="/images/logo.png"
                alt="Sponk Keramik Logo"
                width={80}
                height={20}
                priority
                className="block m-0 p-0 w-20 h-auto transition-transform duration-300 ease-in-out group-hover:scale-110 group-hover:animate-bounce"
                style={{ display: 'block' }}
                quality={85}
              />
              <span className="text-black font-bold text-[24px] mb-0.5 leading-none transition-colors group-hover:text-amber-600">
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
              onClick={handleMenuToggle}
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
        <div className="lg:hidden fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden">
          {/* Hintergrundbild */}
          {menuBackgroundImage && (
            <div className="absolute inset-0 z-0">
              <Image
                src={`/images/kurswerke/${menuBackgroundImage}`}
                alt="Menu Background"
                fill
                className="object-cover"
                quality={90}
                sizes="100vw"
                priority
              />
              {/* Overlay für bessere Textlesbarkeit */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/60"></div>
            </div>
          )}
          
          {/* Menü-Items */}
          <div className="relative z-10 flex flex-col items-center justify-center gap-6 w-full px-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-8 py-5 text-2xl font-semibold transition-colors w-full text-center rounded-lg backdrop-blur-sm ${
                  pathname === item.href
                    ? "text-white bg-amber-700/90 shadow-lg"
                    : "text-white bg-white/20 hover:bg-white/30 shadow-md"
                }`}
                onClick={handleMenuToggle}
              >
                {item.label}
              </Link>
            ))}
          </div>
          
          {/* Schließen-Button */}
          <button
            className="absolute top-6 right-6 p-3 text-white hover:bg-white/20 rounded-full transition-colors z-20 backdrop-blur-sm bg-black/30"
            onClick={handleMenuToggle}
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
