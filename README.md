# 🌐 Adenyr.me - Portfolio Personnel

Portfolio et blog personnel construit avec une stack moderne, optimisé pour la performance et la sécurité.

![Astro](https://img.shields.io/badge/Astro-6.2.1-FF5D01?style=flat-square&logo=astro)
![Node.js](https://img.shields.io/badge/Node.js-22-339933?style=flat-square&logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss)

---

## 🏗️ Stack Technologique

### Framework & Rendering
- **[Astro 6](https://astro.build/)** - Framework SSG/SSR moderne avec support multi-framework
  - Zero-JS par défaut
  - Island Architecture
  - Content Layer API
  - Optimisation d'images native

### Langage & Type Safety
- **TypeScript 5** - Typage statique strict
- **Zod 4** - Validation de schémas au runtime
- **JSDoc** - Documentation intégrée

### Styling
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS framework
  - CSS natif @property
  - Optimisation automatique
- **CSS Modules** - Styles scoped par composant
- **Dark Mode** - Support du thème clair/sombre

### Composants & UI
- **[React 19](https://react.dev/)** - Composants interactifs côté client
  - Server Components (RSC)
  - Hook Streaming
- **[Radix UI](https://www.radix-ui.com/)** - Composants primitifs accessibles
- **[Lucide Icons](https://lucide.dev/)** - Icônes vectorielles
- **[Vaul](https://vaul-js.org/)** - Drawer/Modal component

### Contenu
- **[MDX 5](https://mdxjs.com/)** - Markdown avec composants React
  - Syntax highlighting avec Astro Expressive Code
  - Support des frontmatter YAML
  - Collections de contenu typées
- **[Content Layer](https://docs.astro.build/en/guides/content-collections/)** - Gestion moderne du contenu
  - Loaders (glob, API, etc.)
  - Validation Zod intégrée

### Performance & Optimization
- **[@unpic/astro](https://unpic.pics/astro)** - Images optimisées
  - Responsive images
  - Lazy loading
- **[@playform/compress](https://github.com/playform/compress)** - Compression assets
  - CSS minification
  - JS minification
  - HTML minification
- **Sharp** - Traitement d'images haute performance

### SEO & Metadata
- **[@astrojs/sitemap](https://docs.astro.build/en/guides/integrations-guide/sitemap/)** - Sitemap XML auto-généré
- **[@astrojs/rss](https://docs.astro.build/en/guides/integrations-guide/rss/)** - Flux RSS/Atom
- **[astro-robots-txt](https://github.com/alextim/astro-robots-txt)** - robots.txt auto-généré
- **Metadata dynamique** - Open Graph, Twitter Card

### Animations & Interactions
- **[GSAP 3](https://gsap.com/)** - Animations haute performance
  - Timeline API
  - Easing avancés
- **[Lenis](https://lenis.darkroom.engineering/)** - Smooth scroll
- **View Transitions API** - Transitions entre pages
  - ClientRouter pour SPA-like experience

### Développement
- **HMR** - Hot Module Replacement
- **Fast Refresh** - React Fast Refresh
- **ESLint** - Linting de code
- **Prettier** - Code formatting

### Configuration
- **YAML** - Fichiers de configuration (site.yaml, home.yaml, infra.yaml)
- **Environment Variables** - astro:env pour les secrets

---

## 🚀 Installation & Setup

### Pré-requis
- **Node.js**: 22.12.0 ou supérieur
- **npm**: 10.9.7 ou supérieur

### Installation
```bash
# Cloner le dépôt
git clone <repo-url>
cd adenyrr.me

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env.local
```

### Développement
```bash
# Démarrer le serveur local avec HMR
npm run dev

# Le site est accessible à http://localhost:3000
```

### Build Production
```bash
# Compiler pour la production
npm run build

# Prévisualiser la build
npm run preview
```

---

## 📁 Structure du Projet

```
adenyrr.me/
├── src/
│   ├── components/          # Composants Astro & React
│   │   ├── Animations.astro      # Scripts d'animation GSAP
│   │   ├── BaseHead.astro        # Meta tags & SEO
│   │   ├── Header.astro          # Navigation header
│   │   ├── Footer.astro          # Pied de page
│   │   ├── ThemeToggle.astro     # Sélecteur de thème
│   │   ├── MobileNav.tsx         # Menu mobile (React)
│   │   ├── InfraViz.tsx          # Visualisation infra (React)
│   │   ├── ParticleBackground.astro # Fond particules
│   │   └── ui/                   # Composants Radix UI
│   │       ├── button.tsx
│   │       ├── separator.tsx
│   │       └── sheet.tsx
│   ├── layouts/             # Layouts Astro
│   │   ├── BaseLayout.astro      # Layout principal
│   │   └── BlogPost.astro        # Layout articles blog
│   ├── pages/               # Routing fichier-basé
│   │   ├── index.astro           # Page d'accueil
│   │   ├── blog/
│   │   │   ├── index.astro       # Liste des articles
│   │   │   └── [...slug].astro   # Article dynamique
│   │   ├── infra/
│   │   │   └── index.astro       # Page infrastructure
│   │   ├── rss.xml.js            # Endpoint flux RSS
│   │   └── robots.xml.ts         # robots.txt (auto-généré)
│   ├── content/             # Collections de contenu
│   │   └── blog/
│   │       └── *.md         # Articles blog (MDX)
│   ├── middleware.ts        # Middleware de sécurité (CSP)
│   ├── styles/
│   │   └── global.css            # Styles globaux
│   ├── utils/
│   │   ├── config.ts             # Config loader avec validation Zod
│   │   ├── credly.ts             # API Credly credentials
│   │   └── reading-time.ts       # Calcul temps de lecture
│   ├── lib/
│   │   └── utils.ts              # Utilitaires généraux
│   └── content.config.ts    # Configuration collections
├── config/                  # Fichiers de configuration (YAML)
│   ├── site.yaml                 # Config site (validée)
│   ├── home.yaml                 # Config page accueil
│   └── infra.yaml                # Config infrastructure
├── public/                  # Assets statiques
│   └── images/                   # Images optimisées
├── astro.config.mjs         # Configuration Astro
├── tsconfig.json            # Configuration TypeScript
├── tailwind.config.mjs       # Configuration Tailwind
├── package.json
├── env.d.ts                 # Types des variables d'environnement
├── .env.example             # Variables d'environnement exemple
├── .middleware.ts           # Middleware sécurité (CSP headers)
└── README.md                # Ce fichier
```

---

## 📝 Modifier le Contenu

### 📄 Articles Blog

Les articles sont stockés dans `src/content/blog/` en format MDX.

#### Créer un nouvel article

**Fichier**: `src/content/blog/mon-article.md`

```mdx
---
title: Mon Article
description: Description courte de l'article
pubDate: 2026-04-30
updatedDate: 2026-04-30
heroImage: /images/mon-image.jpg
tags: ["astro", "blog"]
---

# Titre de l'article

Votre contenu en Markdown...

## Sous-titre

Plus de contenu...
```

**Frontmatter disponible**:
- `title` (requis) - Titre de l'article
- `description` (optionnel) - Description courte
- `pubDate` (requis) - Date de publication
- `updatedDate` (optionnel) - Date de mise à jour
- `heroImage` (optionnel) - Image de couverture
- `tags` (optionnel) - Tags/catégories
- `readingTime` (auto-calculé) - Temps de lecture en minutes

#### Intégrer des composants React

```mdx
import { MyComponent } from '../components/MyComponent';

# Mon Article

<MyComponent prop="value" />
```

### 🎨 Configuration Site

**Fichier**: `config/site.yaml`

```yaml
site:
  title: adenyrr                         # Titre du site
  description: Portfolio personnel       # Description
  url: https://adenyrr.me                # URL du site
  author: adenyrr                      # Auteur

seo:
  openGraph: true                         # Activer Open Graph
  twitterCard: true                       # Activer Twitter Card
  sitemap: true                           # Générer sitemap

footer:
  rss: true                               # Afficher lien RSS
  copyright: "© 2026 Adenyrian"           # Copyright

features:
  darkMode: true                          # Thème sombre
  animations: true                        # Animations GSAP
```

### 🏠 Page d'Accueil

**Fichier**: `config/home.yaml`

```yaml
title: "Développeur Full-Stack"
subtitle: "Créateur de solutions web modernes"

cta:
  text: "Voir mes projets"
  href: "/blog"
```

### 🔧 Configuration Infrastructure

**Fichier**: `config/infra.yaml`

Personnaliser les sections d'infrastructure affichées.

### 🌍 Variables d'Environnement

**Fichier**: `.env.local`

```env
PUBLIC_SITE_URL=https://adenyrr.me
PUBLIC_SITE_TITLE=Adenyrr
PUBLIC_SITE_DESCRIPTION=Portfolio personnel
PUBLIC_SITE_AUTHOR=Adenyrr

# Analytics (optionnel)
# PUBLIC_GA_ID=G_XXXXXXX
```

Les variables `PUBLIC_*` sont exposées au navigateur et au build.

### 🎨 Modifier le Design

#### Tailwind Configuration

**Fichier**: `tailwind.config.mjs`

```javascript
export default {
  theme: {
    extend: {
      colors: {
        primary: '#your-color',
      },
    },
  },
}
```

#### Styles Globaux

**Fichier**: `src/styles/global.css`

```css
:root {
  --accent: #ff6b35;
  --muted-text: #666;
  /* ... autres variables */
}

body {
  /* styles globaux */
}
```

#### Dark Mode

Le thème sombre est géré par le sélecteur dans `ThemeToggle.astro`:

```astro
<!-- src/components/ThemeToggle.astro -->
<button id="theme-toggle">
  {/* Bascule le thème */}
</button>
```

---

## 🔐 Sécurité

### Content Security Policy (CSP)

Les en-têtes de sécurité sont définis dans `src/middleware.ts`:

```typescript
// CSP strict pour prévenir XSS
Content-Security-Policy: default-src 'self'; ...

// Autres headers
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
```

### Variables d'Environnement

Les variables sensibles doivent être:
1. Préfixées par `SECRET_` (non exposées au navigateur)
2. Listées dans `env.d.ts` pour la typage
3. Documentées dans `.env.example`

---

## 📊 Performance

### Optimisations Activées

- ✅ **Zero JavaScript** par défaut (SSG)
- ✅ **Compression** automatique des assets (CSS, JS, HTML)
- ✅ **Images optimisées** avec Sharp
- ✅ **Code splitting** automatique
- ✅ **Tree shaking** pour les dépendances
- ✅ **Preconnect** pour Google Fonts
- ✅ **Font-display: swap** pour les fonts externes

### Vérifier les Performances

```bash
# Build production
npm run build

# Analyzer avec Lighthouse
# (générer un rapport Lighthouse via Chrome DevTools)
```

---

## 🧪 Testing & Validation

### Vérifier la Compilation

```bash
# Vérifier les types TypeScript
npm run typecheck  # si configuré

# Vérifier la build
npm run build
```

### Auditer la Sécurité

```bash
# Vérifier les vulnérabilités npm
npm audit

# Vérifier les dépendances obsolètes
npm outdated
```

---

## 📦 Dépendances Clés

| Paquet | Version | Raison |
|--------|---------|--------|
| astro | ^6.0.0 | Framework principal |
| typescript | ^5.0.0 | Type safety |
| tailwindcss | ^4.0.0 | Styling |
| react | ^19.0.0 | Composants interactifs |
| zod | ^4.0.0 | Validation de schémas |
| @astrojs/mdx | ^5.0.0 | Support MDX |
| sharp | ^0.34.0 | Image processing |
| gsap | ^3.14.0 | Animations |

Pour une liste complète, voir `package.json`.

---

## 🚀 Déploiement

Le site est un site statique (SSG) et peut être déployé sur:

- **Vercel** - Intégration Astro native
- **Netlify** - Intégration Astro native
- **GitHub Pages** - Hébergement gratuit
- **Cloudflare Pages** - Performance globale
- **Serveur custom** - Servir le dossier `dist/`

### Exemple Déploiement Vercel

```bash
# Astro est automatiquement détecté
# Juste pousser sur GitHub et connecter à Vercel
npm run build  # Generé dans dist/
```

---

## 📚 Ressources & Documentation

- **[Astro Docs](https://docs.astro.build/)** - Documentation officielle
- **[Astro 6 Migration](https://docs.astro.build/en/guides/upgrade-to/v6/)** - Guide de migration
- **[MDX Documentation](https://mdxjs.com/)** - Support MDX
- **[Tailwind CSS](https://tailwindcss.com/docs)** - Styling guide
- **[TypeScript Handbook](https://www.typescriptlang.org/docs/)** - Type safety
- **[Zod Documentation](https://zod.dev/)** - Validation de schémas

---

## 🔄 Scripts Disponibles

```bash
# Développement
npm run dev        # Démarrer le serveur local

# Build
npm run build      # Compiler pour la production
npm run preview    # Prévisualiser la build

# Utilitaires
npm run astro      # Exécuter astro CLI directement
npm audit          # Vérifier les vulnérabilités
npm audit fix      # Corriger les vulnérabilités
```

---

## 💡 Bonnes Pratiques

### Composants Astro
- Utiliser Astro pour les layouts et les pages statiques
- Garder Astro sans logique complexe
- Importer les composants React pour l'interactivité

### Composants React
- Utiliser `export default` pour les composants React
- Ajouter le directive `client:` pour hydrater côté client
- Typer les props avec TypeScript

### Styling
- Utiliser Tailwind pour les styles généraux
- CSS Modules pour les styles scoped
- Variables CSS pour les thèmes

### Contenu
- Garder les articles en Markdown simple
- Utiliser MDX pour les interactivités
- Valider les frontmatter avec Zod

---

## 📄 License

CC-BY/NC - Libre d'utilisation non commerciale avec attribution de paternité.

---

## 👤 Auteur

**adenyrr**

---

## 📞 Support

Pour des questions ou des issues:
1. Consulter la [documentation Astro](https://docs.astro.build/)
2. Ouvrir une issue sur GitHub
3. Vérifier les fichiers de migration dans le dépôt

---

**Dernière mise à jour**: 2026-04-30 | **Astro Version**: 6.2.1 | **Node.js**: 22.22.2
