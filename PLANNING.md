# PLANNING.md - Sponk Keramik Website

## Projektübersicht
Rebuild der Website sponkkeramik.de mit Next.js 16 (neueste Version) unter Beibehaltung aller Inhalte, Links, Kurse und Informationen.

## Technologie-Stack
- **Framework**: Next.js 16.0.3 (App Router)
- **React**: 19.2.0
- **TypeScript**: 5.x
- **Styling**: Tailwind CSS 4.x
- **Deployment**: Vercel (empfohlen)

## Projektstruktur
```
sponkkeramik/
├── app/
│   ├── layout.tsx          # Root Layout
│   ├── page.tsx            # Homepage
│   ├── globals.css         # Global Styles
│   ├── workshops/          # Workshops & Preise
│   ├── atelier/            # Atelier Werke (Galerie)
│   ├── oeffnungszeiten/    # Öffnungszeiten & Kurszeiten
│   ├── anfahrt/            # Anfahrt & Wegbeschreibung
│   └── kontakt/            # Kontakt
├── components/
│   ├── Header.tsx          # Navigation Header
│   ├── Footer.tsx          # Footer
│   ├── CourseCard.tsx      # Kurs-Karte Komponente
│   └── Gallery.tsx         # Galerie Komponente
├── lib/
│   └── data.ts             # Statische Daten (Kurse, Preise, etc.)
└── public/
    └── images/             # Bilder und Assets
```

## Seitenstruktur
1. **Homepage** (`/`)
   - Begrüßung und Einführung
   - Hauptangebote Übersicht
   - Call-to-Action Buttons

2. **Workshops & Preise** (`/workshops`)
   - Detaillierte Kursliste
   - Beschreibungen, Dauer, Preise
   - Buchungsinformationen

3. **Atelier Werke** (`/atelier`)
   - Galerie mit Keramikkunstwerken
   - Preise und Beschreibungen
   - Künstlerinformationen (Bülent Tepe)

4. **Öffnungszeiten** (`/oeffnungszeiten`)
   - Atelier Öffnungszeiten
   - Kurszeiten Übersicht

5. **Anfahrt** (`/anfahrt`)
   - Wegbeschreibung
   - Öffentliche Verkehrsmittel
   - Parkmöglichkeiten

6. **Kontakt** (`/kontakt`)
   - Kontaktdaten (Adresse, E-Mail, Telefon)
   - Kontaktformular (optional)

## Design-Prinzipien
- **Responsive Design**: Mobile-first Ansatz
- **SEO-Optimierung**: Meta-Tags, strukturierte Daten
- **Accessibility**: WCAG 2.1 konform
- **Performance**: Optimierte Bilder, lazy loading

## Code-Konventionen
- **TypeScript**: Strikte Typisierung
- **Komponenten**: Funktionale Komponenten mit TypeScript
- **Styling**: Tailwind CSS Utility Classes
- **Dateien**: Maximal 500 Zeilen pro Datei
- **Imports**: Relative Imports innerhalb von Packages

## Content-Management
- Statische Inhalte in `lib/data.ts`
- Bilder in `public/images/`
- Für zukünftige CMS-Integration vorbereitet

## Deployment
- **Plattform**: Vercel (empfohlen)
- **Build**: `npm run build`
- **Start**: `npm start`

