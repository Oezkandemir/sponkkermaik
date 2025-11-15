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
    id: "keramik-bemalen-sonntag",
    title: "Keramik Bemalen – Kreativer Sonntags-Workshop",
    description:
      "Ein entspannter Workshop am Sonntag, bei dem Sie Ihre eigene Keramik bemalen können. Perfekt für Anfänger und Fortgeschrittene.",
    duration: "3 Stunden",
    price: "39 € pro Person",
    day: "Sonntag",
    bookingLink: "https://cal.com/sponkkeramik/keramik-bemalen-sonntag",
    featured: true,
  },
  {
    id: "toepferkurs-drehscheibe",
    title: "Töpferkurs an der Drehscheibe",
    description:
      "Lernen Sie die traditionelle Kunst des Töpferns an der Drehscheibe. Unter fachkundiger Anleitung erstellen Sie Ihr eigenes Kunstwerk.",
    duration: "3 Stunden",
    price: "Auf Anfrage",
    bookingLink: "https://cal.com/sponkkeramik/toepferkurs-drehscheibe",
    featured: true,
  },
  {
    id: "keramik-bemalen-allgemein",
    title: "Keramik Bemalen",
    description:
      "Bemalen Sie vorgefertigte Keramikstücke nach Ihren Wünschen. Eine große Auswahl an Formen und Farben steht Ihnen zur Verfügung.",
    duration: "2-3 Stunden",
    price: "Ab 25 €",
    bookingLink: "https://cal.com/sponkkeramik/keramik-bemalen",
  },
  {
    id: "toepferkurs-anfaenger",
    title: "Töpferkurs für Anfänger",
    description:
      "Der perfekte Einstieg in die Welt des Töpferns. Lernen Sie die Grundtechniken und erstellen Sie Ihr erstes eigenes Stück.",
    duration: "2 Stunden",
    price: "35 € pro Person",
    bookingLink: "https://cal.com/sponkkeramik/toepferkurs-anfaenger",
  },
  {
    id: "keramik-workshop-paar",
    title: "Keramik Workshop für Paare",
    description:
      "Ein romantischer Workshop für Paare. Gemeinsam kreativ sein und schöne Erinnerungen schaffen.",
    duration: "2.5 Stunden",
    price: "70 € pro Paar",
    bookingLink: "https://cal.com/sponkkeramik/workshop-paar",
  },
  {
    id: "kinder-workshop",
    title: "Keramik Workshop für Kinder",
    description:
      "Spielerisches Lernen für Kinder ab 6 Jahren. Unter Aufsicht können die Kleinen ihre Kreativität ausleben.",
    duration: "1.5 Stunden",
    price: "25 € pro Kind",
    bookingLink: "https://cal.com/sponkkeramik/kinder-workshop",
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

