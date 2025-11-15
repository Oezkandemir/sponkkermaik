/**
 * Statische Daten für die Sponk Keramik Website
 * Enthält alle Kurse, Preise, Öffnungszeiten und Kontaktinformationen
 */

export interface Workshop {
  id: string;
  title: string;
  description: string;
  duration: string;
  price: string;
  time?: string;
  day?: string;
  bookingLink?: string; // cal.com oder andere Buchungslinks
  featured?: boolean; // Für Featured-Kurse auf der Homepage
  topOffer?: boolean; // Top Angebot Markierung
  badgeText?: string; // Spezifischer Badge-Text (z.B. "Best preis garantie in düsseldorf")
  images?: string[]; // Bilder für den Workshop
}

export interface OpeningHours {
  day: string;
  atelier: string;
  courses: string;
}

export interface ContactInfo {
  address: string;
  postalCode: string;
  city: string;
  email: string;
  vatId: string;
}

export const contactInfo: ContactInfo = {
  address: "Fürstenplatz 15",
  postalCode: "40215",
  city: "Düsseldorf",
  email: "info@sponkkeramik.de",
  vatId: "DE364014744",
};

export const workshops: Workshop[] = [
  {
    id: "workshop-nur-keramik-bemalen-glasieren",
    title: "Workshop nur Keramik Bemalen-Glasieren",
    description:
      "Sonntag keine Eigenen Werke malen! Glasieren (Keramik bemalen) an einem Rohling – pro Person 39 Euro Rohling (Kaffeetasse, Müslischale und Teller). Für Erfahrene, 17 Euro Pauschale + Glasur/Brand 7 Euro + Rohling, 45 Minuten – inkl. Glasur und Brennen. Bei weiterem Rohling wird 5 Euro für Glasur + Brennen dazu kommen. Bei Gruppen ab 8 Personen zuzüglich 19% MwSt.",
    duration: "45 Minuten",
    price: "39 € pro Person (17 € für Erfahrene + 7 € Glasur/Brand + Rohling)",
    day: "Sonntag",
    bookingLink: "https://cal.com/sponkkeramik.de/workshop-nur-keramik-bemalen-glasieren?overlayCalendar=true",
    badgeText: "Best preis garantie in düsseldorf",
    images: [
      "/images/workshops/IMG_4035-738x1024.webp",
    ],
  },
  {
    id: "topferscheibe-testen",
    title: "Töpferscheibe TESTEN",
    description:
      "Erlebe die Faszination des Drehens an der Töpferscheibe! In diesem Schnupperkurs lernst du die Grundlagen des Zentrierens, Hochziehens und Formens von Ton. Unter fachkundiger Anleitung gestaltest du deine ersten eigenen Gefäße in entspannter Atelieratmosphäre. Perfekt zum Ausprobieren und Entdecken deiner Kreativität! Die weiteren Schritte werden vor Ort besprochen.",
    duration: "2,5 Stunden",
    price: "80 € pro Person",
    bookingLink: "https://cal.com/sponkkeramik.de/topferscheibe-testen?overlayCalendar=true",
    topOffer: true,
    images: [
      "/images/workshops/IMG_3994-300x151.webp",
      "/images/workshops/IMG_3995-300x225.webp",
      "/images/workshops/IMG_3996-1-615x1024.webp",
    ],
  },
  {
    id: "aufbau-workshop-1",
    title: "Aufbau-Workshop 1",
    description:
      "Unterschiedliche Aufbautechniken, 3 Stunden Werke herstellen, nach dem ersten Brennen kommst du nochmal ca. 90 Minuten zum bemalen. 3 Werke (Müsslischale, Tasse usw.) möglich. Pro Person, 87,-€ + 18,-€ pro Kg für bemalen und Brennen. Die fertigen Werke werden gewogen.",
    duration: "3 Stunden + 90 Minuten Bemalen",
    price: "87 € pro Person + 18 € pro Kg",
    bookingLink: "https://cal.com/sponkkeramik.de/aufbau-workshop-1?overlayCalendar=true",
    topOffer: true,
    images: [
      "/images/workshops/IMG_3294.webp",
      "/images/workshops/IMG_3295.webp",
      "/images/workshops/IMG_3296.webp",
    ],
  },
  {
    id: "keramik-bemalen-sonntag",
    title: "Keramik Bemalen – Kreativer Sonntags-Workshop",
    description:
      "Gestalte 1.5 Stunden deine eigene Keramik mit Farben, Mustern und Ideen! In entspannter Atelieratmosphäre bemalst du vorgefertigte Rohlinge – Tassen, Schalen oder Teller – ganz nach deinem Stil. Alle Materialien, Glasur und Brand sind inklusive. Perfekt für Einsteiger, Freund*innen oder einen kreativen Sonntag!",
    duration: "1.5 Stunden",
    price: "39 € pro Person",
    day: "Sonntag",
    bookingLink: "https://cal.com/sponkkeramik.de/sonntags-workshop?overlayCalendar=true&month=2025-12",
    featured: true,
    topOffer: true,
    images: [
      "/images/workshops/IMG_3997-300x252.webp",
      "/images/workshops/IMG_3998-300x281.webp",
      "/images/workshops/IMG_3999-570x1024.webp",
    ],
  },
  {
    id: "aufbau-workshop-2",
    title: "Aufbau-Workshop 2",
    description:
      "Unterschiedliche Aufbautechniken – 2 x 3 Stunden – 2 Stunden Glasurtermin – 5 bis 6 Werke (Müsslischale, Tasse usw.) möglich. Pro Person, 157 Euro + 18,- € pro Kilogramm Material und Brennen. Die Werke werden gewogen.",
    duration: "2 x 3 Stunden + 2 Stunden Glasurtermin",
    price: "157 € pro Person + 18 € pro Kg",
    bookingLink: "https://cal.com/sponkkeramik.de/aufbau-workshop-2?overlayCalendar=true",
    topOffer: true,
    images: [
      "/images/workshops/AE454F7E-1EEF-4AA4-8539-59A2E5127C2C-768x861 (1).webp",
    ],
  },
  {
    id: "einsteiger-kurse-topferscheibe",
    title: "Einsteiger-Kurse an der Töpferscheibe",
    description:
      "Übungen an der Töpferscheibe – 3 x 3 Stunden – Glasurtermin – wenn es mit dem Töpfern nicht klappt, Aufbau möglich – bis zu 10 Werke möglich – pro Person 195 Euro – Glasur und Brennen werden nach Anzahl der Werkstücke am Ende berechnet, indem wir wiegen (kg/18 ,- €).",
    duration: "3 x 3 Stunden + Glasurtermin",
    price: "195 € pro Person + 18 € pro Kg",
    bookingLink: "https://cal.com/sponkkeramik.de/einsteiger-kurse-an-der-topferscheibe?overlayCalendar=true",
    topOffer: true,
    images: [
      "/images/workshops/IMG_3906-712x1024 (1).webp",
    ],
  },
  {
    id: "gruppen-events-workshops",
    title: "Gruppen Events-Workshops",
    description:
      "Glasieren an einem Rohling oder Werkeln – auf Wunsch mit Catering Service – pro Person Preis bitte anfragen – + MwSt Glasur und Brennen – bei weiterem Rohling wird 5 Euro für Glasur + Brennen dazu kommen. Kindergeburtstage auf Anfrage. 33,-€ pro Kind. Für Terminabsprachen bitte direkter Email Kontakt: info@sponkkeramik.de",
    duration: "Auf Anfrage",
    price: "Preis auf Anfrage",
    images: [
      "/images/workshops/1000059444-768x768.webp",
    ],
  },
];

export const openingHours = {
  atelier: [
    {
      days: "Dienstag, Mittwoch, Freitag",
      times: "11-16 & 17:30-19:30",
    },
    {
      days: "Samstag",
      times: "11-15 & 16:30-19:30",
    },
  ],
  courses: [
    {
      days: "Dienstag, Mittwoch, Freitag",
      times: "13-16 & 18-21",
    },
    {
      days: "Samstag",
      times: "12-15 & 17-20",
    },
  ],
};

export const directions = {
  address: "Fürstenplatz 15, 40215 Düsseldorf",
  parking: {
    name: "Parkhaus Creativ Center",
    address: "Philipp-Reis-Straße 29, 40215 Düsseldorf",
    description: "Kostenpflichtige Parkplätze verfügbar",
  },
  publicTransport: {
    description:
      "Das Atelier ist gut mit öffentlichen Verkehrsmitteln erreichbar. Die nächsten Haltestellen befinden sich in unmittelbarer Nähe.",
  },
};

export const artistInfo = {
  name: "Bülent Tepe",
  description:
    "Handgefertigte Keramikkunstwerke von Bülent Tepe. Jedes Stück ist ein Unikat und mit Liebe zum Detail gefertigt.",
};

