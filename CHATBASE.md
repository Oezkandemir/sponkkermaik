# Chatbase Chatbot Integration

## Übersicht

Der Chatbase Chatbot wurde erfolgreich auf der Website integriert. Der Chatbot erscheint automatisch auf allen Seiten der Website.

## Aktuelle Implementierung

### ✅ Implementiert

1. **ChatbaseWidget Komponente** (`components/ChatbaseWidget.tsx`)
   - Lädt das Chatbase-Script automatisch
   - Initialisiert den Chatbot auf allen Seiten
   - Bereit für Benutzeridentifikation (aktuell deaktiviert)

2. **Integration im Layout** (`app/layout.tsx`)
   - Chatbot wird auf allen Seiten geladen
   - Keine zusätzliche Konfiguration erforderlich

3. **API-Route für Token-Generierung** (`app/api/chatbase/token/route.ts`)
   - Vorbereitet für zukünftige Benutzeridentifikation
   - Aktuell deaktiviert (keine Anmeldung vorhanden)

## Konfiguration

### Umgebungsvariablen

Erstellen Sie eine `.env.local` Datei im Root-Verzeichnis:

```env
CHATBASE_IDENTITY_SECRET=4sjb9n2bfq730pbjbfu6hudpv0xwg22r
```

**WICHTIG**: 
- Fügen Sie `.env.local` zu `.gitignore` hinzu (bereits vorhanden)
- Verwenden Sie diesen Secret Key nur für die Benutzeridentifikation
- Der Chatbot funktioniert auch ohne diese Variable

## Benutzeridentifikation (Optional)

Falls Sie später eine Benutzeranmeldung implementieren möchten:

### 1. API-Route aktivieren

Öffnen Sie `app/api/chatbase/token/route.ts` und:
- Entfernen Sie die `return`-Anweisung am Anfang
- Implementieren Sie die `getSignedInUser()` Funktion
- Passen Sie die Benutzerattribute an

### 2. ChatbaseWidget aktivieren

Öffnen Sie `components/ChatbaseWidget.tsx` und:
- Entfernen Sie die Kommentare um den `identifyUser()` Code
- Die Komponente wird automatisch Benutzer identifizieren

### Beispiel-Implementierung:

```typescript
// In app/api/chatbase/token/route.ts
const user = await getSignedInUser(); // Ihre Authentifizierungslogik

const token = jwt.sign(
  {
    user_id: user.id,
    email: user.email,
    // Weitere Attribute...
  },
  CHATBASE_IDENTITY_SECRET,
  { expiresIn: '1h' }
);
```

## Chatbase Dashboard

- **Chatbot ID**: `pD2jaDR7B6k89RPlgJbiM`
- **Domain**: `www.chatbase.co`
- **Dashboard**: https://www.chatbase.co

## Technische Details

- **Script URL**: `https://www.chatbase.co/embed.min.js`
- **Ladezeitpunkt**: Nach vollständigem Laden der Seite
- **Kompatibilität**: Funktioniert mit Next.js 16 App Router
- **TypeScript**: Vollständig typisiert

## Fehlerbehebung

### Chatbot erscheint nicht
1. Prüfen Sie die Browser-Konsole auf Fehler
2. Stellen Sie sicher, dass JavaScript aktiviert ist
3. Prüfen Sie die Netzwerkverbindung

### Benutzeridentifikation funktioniert nicht
1. Stellen Sie sicher, dass `CHATBASE_IDENTITY_SECRET` gesetzt ist
2. Prüfen Sie, ob die API-Route korrekt implementiert ist
3. Prüfen Sie die Browser-Konsole auf Fehler

## Support

Bei Fragen zur Chatbase-Integration:
- Chatbase Dokumentation: https://www.chatbase.co/docs
- Projekt-Dokumentation: Siehe `components/ChatbaseWidget.tsx`

