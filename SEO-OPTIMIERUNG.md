# SEO Optimierung - Sponk Keramik Website

## Übersicht der durchgeführten SEO-Optimierungen

Datum: 16. November 2025

### 1. **Root Layout Metadata** (`app/layout.tsx`)

#### Hinzugefügte Optimierungen:
- ✅ **MetadataBase**: Basis-URL für alle relativen URLs gesetzt
- ✅ **Title Template**: Dynamische Titel-Struktur für alle Unterseiten
- ✅ **Erweiterte Keywords**: Array mit relevanten Suchbegriffen
- ✅ **Open Graph Tags**: Vollständige OG-Tags für Social Media Sharing
  - Typ, Locale, URL, Sitename
  - Optimierte Bilder mit Dimensionen
- ✅ **Twitter Cards**: Optimiert für Twitter-Sharing
- ✅ **Robots Meta Tags**: Crawler-Anweisungen für Google
- ✅ **Google Site Verification**: Vorbereitet (Code muss noch eingefügt werden)
- ✅ **Canonical URLs**: Duplicate Content vermeiden

### 2. **Seitenspezifische Metadata**

Für jede Seite wurde ein eigenes `layout.tsx` mit optimierten Metadata erstellt:

#### Hauptseiten:
- **Homepage** (`app/page.tsx`): Direktes Metadata-Export
- **Workshops** (`app/workshops/layout.tsx`): Workshop-spezifische Keywords
- **Kontakt** (`app/kontakt/layout.tsx`): Kontakt- und Standort-fokussiert
- **Anfahrt** (`app/anfahrt/layout.tsx`): Local SEO optimiert
- **Atelier** (`app/atelier/layout.tsx`): Kunstwerk- und Galerie-fokussiert
- **Öffnungszeiten** (`app/oeffnungszeiten/layout.tsx`): Zeitbasierte Keywords
- **Über uns** (`app/ueber-uns/layout.tsx`): Brand-Story und Geschichte

#### SEO-URLs:
- **Kontakt Sponk Keramik** (`app/kontakt-sponk-keramik/layout.tsx`)
- **Anfahrt Sponk Keramik** (`app/anfahrt-sponk-keramik-und-kurse-dusseldorf/layout.tsx`)
- **Atelier Bilder** (`app/atelier-bilder-sponk-keramik-dusseldorf/layout.tsx`)
- **Kurse Atelier Zeiten** (`app/kurse-atelier-zeiten/layout.tsx`)
- **Kurse Preise** (`app/kurse-preise-sponk-keramik/layout.tsx`)
- **Galerie Kurswerke** (`app/galerie-kurswerke/layout.tsx`)
- **Impressum** (`app/impressum/layout.tsx`)

### 3. **Sitemap.xml** (`app/sitemap.ts`)

Erstellt eine dynamische XML-Sitemap mit:
- ✅ Alle Seiten-URLs
- ✅ Prioritäten (1.0 für Homepage, abgestuft für Unterseiten)
- ✅ Change Frequency (weekly/monthly/yearly)
- ✅ Letzte Änderungsdaten

### 4. **Robots.txt** (`app/robots.ts`)

- ✅ Crawler-Anweisungen für alle Bots
- ✅ Erlaubte und blockierte Pfade
- ✅ Sitemap-Referenz

### 5. **Strukturierte Daten (JSON-LD)** (`components/StructuredData.tsx`)

Implementierte Schema.org Markup:
- ✅ **LocalBusiness**: Geschäftsinformationen
  - Name, Adresse, Kontakt
  - Geo-Koordinaten
  - Öffnungszeiten
  - Preisspanne
- ✅ **WebSite**: Website-Informationen
  - Such-Funktionalität vorbereitet
- ✅ **Service**: Angebotene Dienstleistungen
  - Keramik bemalen
  - Töpferkurse
- ✅ **BreadcrumbList**: Navigationsstruktur

### 6. **Keyword-Optimierung**

#### Haupt-Keywords:
- "Keramik bemalen Düsseldorf"
- "Töpferkurs Düsseldorf"
- "Keramik Workshop Düsseldorf"
- "Keramik Kurse"
- "Töpfern lernen"
- "Handgefertigte Keramik"
- "Keramik Atelier Düsseldorf"

#### Long-Tail Keywords:
- "Kindergeburtstag Keramik Düsseldorf"
- "Töpferscheibe Workshop"
- "Keramik Gruppenevents"
- "Handgemachte Keramik kaufen"

## Nächste Schritte für optimales SEO

### 1. Google Search Console einrichten:
```
1. Gehe zu: https://search.google.com/search-console
2. Füge die Website hinzu: https://www.sponkkeramik.de
3. Verifiziere mit dem Code aus layout.tsx (Zeile 82)
4. Reiche die Sitemap ein: https://www.sponkkeramik.de/sitemap.xml
```

### 2. Google Business Profile optimieren:
- Stelle sicher, dass alle Informationen aktuell sind
- Füge hochwertige Fotos hinzu
- Sammle regelmäßig Bewertungen
- Poste Updates und Angebote

### 3. Social Media Meta Tags testen:
- **Facebook Sharing Debugger**: https://developers.facebook.com/tools/debug/
- **Twitter Card Validator**: https://cards-dev.twitter.com/validator
- **LinkedIn Post Inspector**: https://www.linkedin.com/post-inspector/

### 4. Performance optimieren:
```bash
# Bilder optimieren
npm run build
# Lighthouse Audit durchführen
npx lighthouse https://www.sponkkeramik.de --view
```

### 5. Local SEO verbessern:
- ✅ NAP (Name, Address, Phone) konsistent halten
- ✅ Google Maps Einbettung bereits vorhanden
- 📝 Lokale Verzeichnisse (Yelp, TripAdvisor, etc.)
- 📝 Lokale Backlinks aufbauen

### 6. Content Marketing:
- Blog-Bereich für Keramik-Tipps erstellen
- Tutorial-Videos einbinden
- Regelmäßige Social Media Posts
- Newsletter mit Kurs-Updates

## Technische Details

### Metadata-Struktur:
```typescript
export const metadata: Metadata = {
  title: "Seitentitel",
  description: "SEO-optimierte Beschreibung (150-160 Zeichen)",
  keywords: ["Keyword 1", "Keyword 2", ...],
  openGraph: {
    title: "OG Titel",
    description: "OG Beschreibung",
    url: "Kanonische URL",
    images: [{ url, width, height, alt }],
  },
  alternates: {
    canonical: "Kanonische URL",
  },
};
```

### Vorteile der Implementierung:

1. **Bessere Rankings**:
   - Relevante Keywords strategisch platziert
   - Strukturierte Daten für Rich Snippets
   - Mobile-optimierte Metadata

2. **Höhere Click-Through-Rate (CTR)**:
   - Ansprechende Descriptions
   - Optimierte Open Graph Bilder
   - Rich Snippets in Suchergebnissen

3. **Local SEO**:
   - Geo-Koordinaten in strukturierten Daten
   - Adresse und Öffnungszeiten maschinenlesbar
   - Google Maps Integration

4. **Social Media**:
   - Perfekte Vorschau-Bilder
   - Optimierte Texte für Sharing
   - Twitter Cards aktiv

## Monitoring & Analytics

### Empfohlene Tools:
1. **Google Search Console**: Überwache Rankings und Klicks
2. **Google Analytics 4**: Verfolge Nutzerverhalten
3. **Google Business Profile**: Local SEO Performance
4. **Semrush/Ahrefs**: Keyword-Tracking (optional)

### KPIs zum Tracken:
- Organische Suchzugriffe
- Keyword-Rankings für Hauptbegriffe
- Click-Through-Rate (CTR)
- Bounce Rate
- Verweildauer
- Conversion Rate (Workshop-Buchungen)

## Wartung

### Monatlich:
- Prüfe Rankings in Google Search Console
- Aktualisiere Öffnungszeiten falls nötig
- Füge neue Kurs-Angebote hinzu

### Quartalsweise:
- Keyword-Analyse und Anpassung
- Content-Updates für Saisonalität
- Backlink-Audit

### Jährlich:
- Vollständige SEO-Audit
- Wettbewerbs-Analyse
- Strategie-Anpassung

---

## Kontakt für Fragen

Bei Fragen zur SEO-Optimierung wenden Sie sich an Ihren Web-Entwickler.

**Erstellt am**: 16. November 2025
**Version**: 1.0

