# Email Template Setup Guide

## Übersicht

Dieses Dokument erklärt, wie Sie die Supabase Email-Templates anpassen können, um das Logo größer zu machen und den Text "Sponk Keramik" zu entfernen.

## Email-Templates in Supabase anpassen

### Schritt 1: Zugriff auf Email-Templates

1. Gehen Sie zu Ihrem Supabase Dashboard: https://app.supabase.com
2. Wählen Sie Ihr Projekt aus
3. Navigieren Sie zu **Authentication** → **Email Templates**
4. Wählen Sie das Template **Confirm signup** aus

### Schritt 2: Template anpassen

Ersetzen Sie den Header-Bereich des Templates mit folgendem Code:

```html
<div style="background-color: #d97706; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
  <img src="https://www.sponkkeramik.de/images/emaillogo.webp" alt="Sponk Keramik Logo" style="width: 100%; max-width: 400px; height: auto; display: block; margin: 0 auto;" />
</div>
```

### Vollständiges Template-Beispiel

Hier ist ein vollständiges Beispiel für das **Confirm signup** Template:

```html
<h2>Bestätigen Sie Ihre E-Mail-Adresse</h2>

<p>Folgen Sie dem untenstehenden Link, um Ihre E-Mail-Adresse zu bestätigen:</p>

<p><a href="{{ .ConfirmationURL }}">E-Mail-Adresse bestätigen</a></p>

<p>Wenn Sie sich nicht registriert haben, können Sie diese E-Mail ignorieren.</p>

<div style="background-color: #d97706; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; margin-top: 30px;">
  <img src="https://www.sponkkeramik.de/images/emaillogo.webp" alt="Sponk Keramik Logo" style="width: 100%; max-width: 400px; height: auto; display: block; margin: 0 auto;" />
</div>
```

### Wichtige Änderungen:

1. **Logo größer machen:**
   - `width: 100%` - Logo füllt den gesamten Container
   - `max-width: 400px` - Maximale Breite für größere Bildschirme
   - `height: auto` - Behält das Seitenverhältnis bei

2. **Text entfernen:**
   - Entfernen Sie alle `<h1>` oder Text-Elemente mit "Sponk Keramik"
   - Nur das Logo-Bild bleibt im Header

3. **Padding anpassen:**
   - `padding: 40px 20px` - Mehr Platz um das Logo
   - Der Header-Bereich füllt sich komplett mit dem Logo

### Schritt 3: Template speichern

1. Klicken Sie auf **Save** oder **Update**
2. Testen Sie das Template, indem Sie eine neue Registrierung durchführen

## Verfügbare Variablen

In Supabase Email-Templates können Sie folgende Variablen verwenden:

- `{{ .ConfirmationURL }}` - Link zur E-Mail-Bestätigung
- `{{ .Email }}` - E-Mail-Adresse des Benutzers
- `{{ .Token }}` - Bestätigungstoken (normalerweise nicht benötigt)
- `{{ .TokenHash }}` - Gehashtes Token

## Logo-URL

Das Logo wird von folgender URL geladen:
```
https://www.sponkkeramik.de/images/emaillogo.webp
```

Stellen Sie sicher, dass diese URL öffentlich zugänglich ist.

## Weitere Email-Templates

Sie können auch andere Templates anpassen:

- **Confirm signup** - Bestätigungs-E-Mail bei Registrierung
- **Magic Link** - Magic Link E-Mail
- **Change Email Address** - E-Mail-Änderung
- **Reset Password** - Passwort-Reset E-Mail

Für alle Templates gilt das gleiche Prinzip: Logo groß machen, Text entfernen.

## Troubleshooting

### Logo wird nicht angezeigt

1. Überprüfen Sie, ob die URL öffentlich zugänglich ist
2. Testen Sie die URL direkt im Browser
3. Stellen Sie sicher, dass das Bildformat unterstützt wird (WebP, PNG, JPG)

### Logo ist zu klein

1. Erhöhen Sie die `max-width` auf einen größeren Wert (z.B. 500px oder 600px)
2. Erhöhen Sie das `padding` für mehr Platz
3. Verwenden Sie `width: 100%` statt einer festen Breite

### Template wird nicht aktualisiert

1. Speichern Sie das Template erneut
2. Löschen Sie den Browser-Cache
3. Testen Sie mit einer neuen E-Mail-Adresse

## Beispiel: Vollständiges HTML-Template

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { 
      font-family: Arial, sans-serif; 
      line-height: 1.6; 
      color: #333; 
      margin: 0; 
      padding: 0; 
      background-color: #f9fafb;
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      background-color: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header { 
      background-color: #d97706; 
      padding: 40px 20px; 
      text-align: center; 
    }
    .logo { 
      width: 100%; 
      max-width: 400px; 
      height: auto; 
      display: block; 
      margin: 0 auto; 
    }
    .content { 
      padding: 30px 20px; 
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #d97706;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
    }
    .footer { 
      text-align: center; 
      padding: 20px; 
      color: #666; 
      font-size: 12px; 
      background-color: #f9fafb;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://www.sponkkeramik.de/images/emaillogo.webp" alt="Sponk Keramik Logo" class="logo" />
    </div>
    <div class="content">
      <h2>Bestätigen Sie Ihre E-Mail-Adresse</h2>
      <p>Hallo,</p>
      <p>vielen Dank für Ihre Registrierung bei Sponk Keramik!</p>
      <p>Bitte bestätigen Sie Ihre E-Mail-Adresse, indem Sie auf den folgenden Link klicken:</p>
      <p style="text-align: center;">
        <a href="{{ .ConfirmationURL }}" class="button">E-Mail-Adresse bestätigen</a>
      </p>
      <p>Wenn Sie sich nicht registriert haben, können Sie diese E-Mail ignorieren.</p>
      <p>Mit freundlichen Grüßen,<br>Ihr Team von Sponk Keramik</p>
    </div>
    <div class="footer">
      <p>Fürstenplatz 15, 40215 Düsseldorf</p>
      <p>info@sponkkeramik.de</p>
    </div>
  </div>
</body>
</html>
```

## Zusammenfassung

- ✅ Logo füllt den gesamten Header-Bereich
- ✅ Text "Sponk Keramik" wurde entfernt
- ✅ Logo ist größer und prominenter
- ✅ Responsive Design für verschiedene E-Mail-Client




