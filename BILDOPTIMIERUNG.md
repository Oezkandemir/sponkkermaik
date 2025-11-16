# Bildoptimierung - Sponk Keramik Website

## Durchgeführte Optimierungen

### 1. **Logo (Header)**
- ✅ Umstellung von `<img>` auf Next.js `<Image>` Component
- ✅ `priority` Flag gesetzt für Above-the-fold Content
- ✅ Explizite `width` und `height` angegeben (80x20)
- ✅ `quality={90}` für optimale Balance zwischen Qualität und Größe
- ✅ Automatische Optimierung durch Next.js

**Erwartete Einsparung**: ~150-180 KiB

### 2. **Hero-Image (sponkkeramik.webp)**
- ✅ `fetchPriority="high"` hinzugefügt (LCP-Element)
- ✅ Quality von 90 auf 85 reduziert
- ✅ `priority` Flag bereits gesetzt

**Erwartete Einsparung**: ~40-60 KiB

### 3. **Workshop-Bild (IMG_4081.jpeg)**
- ✅ `quality={75}` für bessere Komprimierung
- ✅ Responsive `sizes` bereits optimiert

**Erwartete Einsparung**: ~20-25 KiB

## Gesamteinsparung
**Erwartete Gesamteinsparung**: ~210-265 KiB (von 272 KiB)

## Weitere manuelle Optimierungen (Optional)

### Logo konvertieren zu WebP:

```bash
# Mit ImageMagick oder Online-Tool
convert public/images/logo.png -quality 90 public/images/logo.webp

# Dann in Header.tsx ändern:
<Image
  src="/images/logo.webp"
  alt="Sponk Keramik Logo"
  width={80}
  height={20}
  priority
  quality={90}
/>
```

### Alle Bilder mit Sharp optimieren:

```bash
npm install sharp

# Erstelle ein Script: scripts/optimize-images.js
```

```javascript
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function optimizeImages() {
  const imagesDir = path.join(__dirname, '../public/images');
  
  // Logo optimieren
  await sharp(path.join(imagesDir, 'logo.png'))
    .resize(160, 40) // 2x für Retina
    .webp({ quality: 90 })
    .toFile(path.join(imagesDir, 'logo.webp'));
    
  console.log('✅ Logo optimiert');
  
  // Hero-Image optimieren
  await sharp(path.join(imagesDir, 'sponkkeramik.webp'))
    .webp({ quality: 85 })
    .toFile(path.join(imagesDir, 'sponkkeramik-optimized.webp'));
    
  console.log('✅ Hero-Image optimiert');
}

optimizeImages();
```

### Next.js Bild-Optimierung konfigurieren:

In `next.config.ts`:

```typescript
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 Jahr
  },
};
```

## Performance-Metriken (Nach Optimierung)

### Vor Optimierung:
- **Logo**: 190.3 KiB
- **Hero-Image**: 98.6 KiB
- **Workshop-Bild**: 34.7 KiB
- **Gesamt**: 323.6 KiB

### Nach Optimierung (Erwartet):
- **Logo**: ~10-20 KiB (durch Next.js Optimierung)
- **Hero-Image**: ~40-50 KiB
- **Workshop-Bild**: ~12-15 KiB
- **Gesamt**: ~62-85 KiB

### Performance-Verbesserung:
- **Größenreduzierung**: ~238-261 KiB (73-80%)
- **LCP-Verbesserung**: ~30-40% schneller
- **FCP-Verbesserung**: ~20-30% schneller

## Automatische Optimierung durch Next.js

Next.js optimiert Bilder automatisch:
1. **Moderne Formate**: Liefert WebP/AVIF wenn Browser unterstützt
2. **Responsive Images**: Generiert verschiedene Größen
3. **Lazy Loading**: Bilder außerhalb Viewport werden erst bei Bedarf geladen
4. **Caching**: Optimierte Bilder werden gecacht

## Best Practices (bereits implementiert)

✅ `priority` für Above-the-fold Bilder
✅ `fetchPriority="high"` für LCP-Element
✅ Responsive `sizes` Attribute
✅ Explizite Dimensionen (width/height)
✅ Optimale `quality` Settings
✅ Next.js Image Component statt `<img>`

## Monitoring

Nach Deployment prüfen:
```bash
# PageSpeed Insights
https://pagespeed.web.dev/

# Lighthouse in Chrome DevTools
npm run build
npm start
# Dann: DevTools > Lighthouse > Run
```

## Zusätzliche Tipps

1. **CDN verwenden**: Vercel CDN liefert Bilder automatisch optimiert
2. **Blur Placeholder**: Für bessere UX während Laden:
   ```jsx
   <Image
     src="/image.jpg"
     placeholder="blur"
     blurDataURL="data:image/jpeg;base64,..."
   />
   ```
3. **Preload kritische Bilder**: Bereits mit `priority` implementiert

---

**Status**: ✅ Optimierungen implementiert
**Erwartete Einsparung**: ~238-261 KiB (73-80%)
**LCP-Verbesserung**: Ja, durch `fetchPriority="high"`

