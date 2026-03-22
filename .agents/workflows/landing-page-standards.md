---
description: Padrões profissionais da Landing Page — CSS tokens, tipos, SEO, i18n
---

# Landing Page — Padrões de Desenvolvimento

## 1. Design Tokens (CSS Custom Properties)

Todos os estilos visuais da landing usam tokens em `src/app/globals.css` sob `:root`.

**Regra:** NUNCA usar hex/rgba inline em `style={{}}`. Sempre criar/usar um token.

### Tokens disponíveis

| Token | Uso |
|---|---|
| `--landing-gradient-title` | h1 hero (indigo→purple→pink) |
| `--landing-gradient-text` | h2 de seções (white→indigo) |
| `--landing-gradient-logo` | Logo Tracka |
| `--landing-gradient-cta` | Botões CTA |
| `--landing-gradient-popular` | Badge Popular (amber→orange) |
| `--landing-gradient-page` | Background da página |
| `--landing-card-bg` / `active` | Cards normais / ativos |
| `--landing-card-border` / `active` | Bordas de cards |
| `--landing-card-hover-glow` | Glow on hover |
| `--landing-header-bg` | Header glassmorphism |
| `--landing-testimonial-bg` / `card-bg` | Seção de depoimentos |
| `--landing-cta-bg` / `border` | Seção CTA |
| `--landing-footer-gradient` | Footer gradient |
| `--landing-divider` | Divider decorativo |
| `--landing-orb-*` | Orbs animados (×4) |
| `--landing-icon-box-bg` / `border` | Icon boxes do FeatureRow |
| `--landing-faq-bg` / `border` | FAQ accordion |
| `--landing-badge-text` | Cor texto de badges |
| `--landing-disclaimer-bg` / `border` | Disclaimer de câmbio |
| `--landing-grid-line` | Grid pattern decorativo |

### Utility classes

```css
.landing-text-gradient  → gradient em h2 de seções
.landing-title-gradient → gradient do h1 hero
.landing-logo-gradient  → gradient do logo
```

---

## 2. Imports de Tipos

**Regra:** Sempre importar tipos de `@/types` (barrel), NUNCA de `@/config/landing.config`.

```tsx
// ✅ Correto
import type { FAQItem, PricingParams, FooterLinkItem } from '@/types';

// ❌ Errado
import { FAQItem } from '@/config/landing.config';
```

Tipos disponíveis em `@/types`:
- `FeatureItem`, `FAQItem`, `FooterLinkItem`, `TestimonialItem`
- `PricingParams`, `PricingVisibility`, `LandingPageConfig`

---

## 3. Estrutura de Componente

Cada componente landing segue este padrão:

```tsx
/**
 * @file NomeDoComponente.tsx
 * @description Descrição do componente.
 */

'use client'; // apenas se usar hooks

import type { TipoRelevante } from '@/types';

interface NomeDoComponenteProps {
    // props tipadas
}

export function NomeDoComponente({ ...props }: NomeDoComponenteProps) {
    // ...
}
```

---

## 4. Config Flags

Todas as seções são condicionais via `config`:

```tsx
{config.showFeatures !== false && <FeaturesSection ... />}
{config.showTechnology !== false && <TechnologySection ... />}
{config.showTestimonials && <TestimonialsSection ... />}
{config.showPricing !== false && <PricingSection ... />}
{config.showFaq !== false && <FAQSection ... />}
```

---

## 5. i18n

- Todas as strings visíveis vêm do `t()` (namespace `tracka`) ou `tc()` (namespace `corporate`)
- Chaves de tradução em `messages/pt.json` e `messages/en.json`
- Nunca hardcodar texto PT/EN no código

---

## 6. SEO Checklist

| Item | Arquivo |
|---|---|
| `robots.txt` | `src/app/robots.ts` |
| `sitemap.xml` | `src/app/sitemap.ts` |
| Metadata (title, desc, OG, Twitter) | `generateMetadata()` em cada page |
| JSON-LD (Schema.org) | `page.tsx` — SoftwareApplication + Organization + FAQPage |
| Canonical + alternates (hreflang) | `generateMetadata()` |
| Keywords por locale | `generateMetadata()` |
| aria-labels em `<nav>` | Header + Footer |
| Heading hierarchy | 1×h1 + N×h2 + N×h3 por página |

---

## 7. Componentes Landing

| Componente | Arquivo | Client? |
|---|---|---|
| LandingHeader | `LandingHeader.tsx` | ✅ |
| HeroSection | `HeroSection.tsx` | ❌ |
| FeaturesSection | `FeaturesSection.tsx` | ❌ |
| TechnologySection | `TechnologySection.tsx` | ❌ |
| PricingSection | `PricingSection.tsx` | ✅ |
| TestimonialsSection | `TestimonialsSection.tsx` | ✅ |
| FAQSection | `FAQSection.tsx` | ✅ |
| CallToActionSection | `CallToActionSection.tsx` | ❌ |
| LandingFooter | `LandingFooter.tsx` | ❌ |
| SharedLandingComponents | `SharedLandingComponents.tsx` | ❌ |
