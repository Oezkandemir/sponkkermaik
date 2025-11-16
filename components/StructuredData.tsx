/**
 * JSON-LD Structured Data Component
 * Provides rich snippets for search engines
 */
export default function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": "https://www.sponkkeramik.de/#organization",
        "name": "Sponk Keramik",
        "alternateName": "Sponk Keramik & Kurse Düsseldorf",
        "url": "https://www.sponkkeramik.de",
        "logo": "https://www.sponkkeramik.de/images/logo.png",
        "image": [
          "https://www.sponkkeramik.de/images/sponkkeramik.webp",
          "https://www.sponkkeramik.de/images/atelier/IMG_5264-1152x1536.webp"
        ],
        "description": "Sponk Keramik bietet Keramik bemalen, Töpferkurse und handgefertigte Keramikkunst in Düsseldorf. Workshops für Anfänger und Fortgeschrittene.",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Fürstenplatz 15",
          "addressLocality": "Düsseldorf",
          "postalCode": "40215",
          "addressCountry": "DE"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": "51.213259",
          "longitude": "6.782244"
        },
        "email": "mailto:info@sponkkeramik.de",
        "telephone": "+49-211-XXXXXXX",
        "priceRange": "€€",
        "openingHoursSpecification": [
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Tuesday", "Wednesday"],
            "opens": "15:00",
            "closes": "19:00"
          },
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": "Friday",
            "opens": "15:00",
            "closes": "19:00"
          },
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": "Saturday",
            "opens": "11:00",
            "closes": "17:00"
          }
        ],
        "sameAs": [
          "https://www.instagram.com/sponkkeramik",
          "https://www.facebook.com/sponkkeramik"
        ]
      },
      {
        "@type": "WebSite",
        "@id": "https://www.sponkkeramik.de/#website",
        "url": "https://www.sponkkeramik.de",
        "name": "Sponk Keramik Düsseldorf",
        "description": "Keramik bemalen & Töpferkurse in Düsseldorf",
        "publisher": {
          "@id": "https://www.sponkkeramik.de/#organization"
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://www.sponkkeramik.de/search?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "Service",
        "serviceType": "Keramik Workshops",
        "provider": {
          "@id": "https://www.sponkkeramik.de/#organization"
        },
        "areaServed": {
          "@type": "City",
          "name": "Düsseldorf"
        },
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "Keramik Workshops",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Keramik bemalen",
                "description": "Bemalen Sie vorgefertigte Keramikstücke nach Ihren Wünschen"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Töpferkurs",
                "description": "Lernen Sie die traditionelle Kunst des Töpferns an der Drehscheibe / Werkbank"
              }
            }
          ]
        }
      },
      {
        "@type": "BreadcrumbList",
        "@id": "https://www.sponkkeramik.de/#breadcrumb",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://www.sponkkeramik.de"
          }
        ]
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

