# Street Lens — Comunitate de Street Photography

Site modern pentru comunitatea de fotografi de stradă 
cu focus pe photowalk-uri săptămânale, hartă interactivă și secțiuni bine organizate.

## Funcționalități

- **Homepage editorial** — design magazine, hero full-screen, statistici comunitate
- **Navigare cu dropdown-uri** — meniu structurat pe categorii (Comunitate, Fotografie, Concursuri, Magazin, Resurse)
- **3 formate foto** — Digital, Analog, Telefon — cu pagini dedicate
- **Photowalk-uri** — arhivă walk-uri cu teme, locații, participanți
- **Hartă interactivă** — pin-uri cu poze pe traseele photowalk-urilor (Leaflet + OpenStreetMap)
- **Concursuri** — temă lunară, deadline, premii
- **Galerie masonry** — lucrări din comunitate, filtrabile pe format
- **Merch** — produse comunitate + secțiune Print (placeholder)
- **Membership** — 3 tier-uri (placeholder pentru integrare ulterioară)

## Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Leaflet / react-leaflet** — hărți interactive
- **Lucide React** — iconițe
- Imagini placeholder de pe **Unsplash**

## Rulare locală

```bash
npm install
npm run dev
```

Deschide [http://localhost:3000](http://localhost:3000).

## Structură pagini

| Rută | Descriere |
|------|-----------|
| `/` | Homepage |
| `/photowalks` | Lista photowalk-uri |
| `/photowalks/[id]` | Detaliu walk + hartă |
| `/harta` | Harta interactivă |
| `/fotografie/digital` | Secțiune digital |
| `/fotografie/analog` | Secțiune analog |
| `/fotografie/telefon` | Secțiune telefon |
| `/concursuri` | Concurs activ |
| `/galerie` | Galerie membri |
| `/magazin` | Merch |
| `/membership` | Planuri membership |

## Următorii pași (sugestii)

1. **Autentificare** — NextAuth / Clerk pentru conturi membri
2. **Upload pin-uri** — formulare + storage (Cloudinary/S3) pe hartă
3. **CMS** — Sanity sau WordPress headless pentru articole/blog
4. **Plăți** — Stripe pentru membership și merch
5. **Print on demand** — integrare Printful/Gelato
6. **Forum** — Discourse sau custom cu comentarii

## Design

- Paletă: negru editorial + cream/warm + accent roșu (#e63946)
- Fonturi: Instrument Serif (titluri) + DM Sans (body)
- Layout magazine/editorial, responsive, mobile-first
