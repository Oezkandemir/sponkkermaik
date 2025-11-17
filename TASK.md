# TASK.md - Sponk Keramik Website Rebuild

## Aktuelle Aufgaben

### 2024-12-19 - Website Rebuild
- [x] Next.js Projekt initialisieren
- [ ] Website-Inhalte von sponkkeramik.de analysieren und extrahieren
- [ ] Projektstruktur und Routing aufbauen
- [ ] Alle Seiten und Komponenten erstellen
- [ ] Kurse und Inhalte integrieren
- [ ] Styling und Design implementieren
- [ ] PLANNING.md und TASK.md erstellen

### 2025-11-16 - SEO Optimierung
- [x] Root Layout Metadata mit Open Graph und Twitter Cards optimieren
- [x] Individuelle Metadata für alle Seiten hinzufügen
- [x] Sitemap.xml erstellen
- [x] Robots.txt erstellen
- [x] JSON-LD strukturierte Daten hinzufügen
- [x] Canonical URLs für alle Seiten setzen
- [x] Keywords für bessere Auffindbarkeit optimieren

### 2025-01-XX - Internationalisierung (i18n) mit next-intl
- [x] next-intl Package installiert
- [x] i18n Konfiguration erstellt (de als Standard, en als zweite Sprache)
- [x] Middleware für Locale-Erkennung eingerichtet
- [x] App-Struktur für [locale] Routing umgestellt
- [x] Übersetzungsdateien für Deutsch und Englisch erstellt
- [x] Homepage mit Übersetzungen aktualisiert
- [x] Header-Komponente mit Übersetzungen und Sprachumschalter aktualisiert
- [x] Footer-Komponente mit Übersetzungen aktualisiert
- [x] CourseCard-Komponente mit Übersetzungen aktualisiert
- [x] Sprachumschalter-Komponente erstellt
- [ ] Weitere Seiten (Workshops, Kontakt, Öffnungszeiten, Anfahrt, etc.) mit Übersetzungen aktualisieren
- [ ] Workshop-Inhalte (Titel, Beschreibungen) übersetzen
- [ ] Metadata für beide Sprachen aktualisieren
- [ ] Sitemap und Robots für Locale-Support aktualisieren

### 2025-11-16 - Benutzerauthentifizierung mit Supabase
- [x] @supabase/ssr und @supabase/supabase-js Pakete installiert
- [x] Supabase Client-Utilities für Server- und Client-Komponenten erstellt
- [x] Authentifizierungs-Übersetzungen zu de.json und en.json hinzugefügt
- [x] Anmeldeseite (/auth/signin) erstellt
- [x] Registrierungsseite (/auth/signup) erstellt
- [x] Auth-Callback Route Handler erstellt
- [x] Middleware für Auth-Session-Updates aktualisiert
- [x] Benutzer-Icon zum Header mit Dropdown-Menü hinzugefügt
- [x] UserMenu-Komponente für authentifizierte Benutzer erstellt
- [ ] Supabase-Projekt konfigurieren (URL und Anon Key in .env.local hinzufügen)
- [ ] Profilseite erstellen
- [ ] Buchungsseite erstellen
- [ ] Einstellungsseite erstellen

### 2025-11-16 - PayPal Checkout Integration
- [x] @paypal/paypal-server-sdk Paket installiert
- [x] PayPal Client-Konfiguration erstellt (lib/paypal/client.ts)
- [x] PayPal TypeScript-Typen definiert (lib/paypal/types.ts)
- [x] API Route für PayPal Order Creation erstellt (app/api/paypal/create-order/route.ts)
- [x] API Route für PayPal Order Capture erstellt (app/api/paypal/capture-order/route.ts)
- [x] VoucherPurchaseModal mit PayPal-Integration aktualisiert
- [x] PayPal-Übersetzungen bereits vorhanden in de.json und en.json
- [ ] PayPal-Umgebungsvariablen in .env.local hinzufügen:
  - NEXT_PUBLIC_PAYPAL_CLIENT_ID (Client ID from PayPal Dashboard)
  - PAYPAL_CLIENT_SECRET (Secret from PayPal Dashboard)
  - PAYPAL_ENVIRONMENT ('sandbox' for testing, 'live' for production)
- [ ] PayPal-Callback-Handler für Return/Cancel URLs implementieren
- [ ] Gutschein-Generierung und Speicherung in Datenbank implementieren
- [ ] E-Mail-Versand für Gutschein-Bestätigungen implementieren

## Abgeschlossene Aufgaben

### 2024-12-19
- [x] Next.js 16 Projekt mit TypeScript und Tailwind CSS initialisiert
- [x] PLANNING.md erstellt
- [x] TASK.md erstellt

## Entdeckt während der Arbeit
_(Hier werden neue Aufgaben hinzugefügt, die während der Entwicklung entdeckt werden)_

