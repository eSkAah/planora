# 🎨 Planora - Guide des Règles UI/UX

> Documentation officielle des principes de design et d'interaction de Planora

---

## 📐 Principes Fondamentaux

### Design System
- **Style** : Apple-inspired, premium, minimaliste
- **Philosophie** : Subtilité et élégance avant tout
- **Transitions** : Toujours smooth et fluides (300ms par défaut)
- **Feedback** : Visuel immédiat mais discret

---

## 🎨 Couleurs & Thème

### Palette Principale
```css
/* Background principal */
background: #071427

/* Accent jaune (CTA, highlights) */
accent: #F2E94E

/* Glassmorphism */
glass: bg-white/12 backdrop-blur-2xl
glass-hover: bg-white/10

/* Borders */
border-default: border-white/15
border-hover: border-white/20
```

### Hiérarchie de Texte
```css
/* Titres */
h1: text-4xl font-semibold text-white
h2: text-2xl font-semibold text-white
h3: text-lg font-semibold text-white

/* Corps de texte */
body: text-white/70
secondary: text-white/60
tertiary: text-white/50
disabled: text-white/30
```

---

## 🎯 Composants Interactifs

### 1. Cartes (Cards)

#### Card Standard
```tsx
<Card className="rounded-[24px] border border-white/15 bg-white/12 backdrop-blur-2xl">
  {/* Contenu */}
</Card>
```

#### Card avec Hover Premium
```tsx
<Card className="
  group
  rounded-[24px]
  border border-white/10
  bg-white/5
  transition-all duration-300
  hover:scale-[1.01]          /* Très subtil ! */
  hover:border-white/20
  hover:bg-white/10
  hover:shadow-lg
  hover:shadow-white/5
">
  {/* Contenu */}
</Card>
```

**Règles :**
- ✅ Toujours `rounded-[24px]` ou `rounded-[32px]`
- ✅ Scale maximum : `1.02` (très subtil)
- ✅ Transitions : `duration-300`
- ✅ Shadows : toujours avec couleur `white/5` ou `white/10`
- ❌ PAS de scale > 1.05 (trop agressif)
- ❌ PAS de transitions < 200ms (trop rapide)

### 2. Boutons

#### Bouton Principal (CTA)
```tsx
<Button className="
  rounded-2xl
  bg-[#F2E94E]
  px-6 py-6
  text-[#071427]
  transition-all duration-300
  hover:bg-[#F2E94E]/90
  hover:shadow-lg
  hover:shadow-[#F2E94E]/20
">
  Action
</Button>
```

#### Bouton Ghost
```tsx
<Button
  variant="ghost"
  className="
    rounded-2xl
    text-white/70
    hover:bg-white/10
    hover:text-white
  "
>
  Annuler
</Button>
```

**Règles :**
- ✅ Toujours `rounded-2xl` minimum
- ✅ Hover doit changer opacité ET ajouter shadow subtile
- ✅ Icônes : `h-5 w-5` par défaut, `h-4 w-4` pour petit

### 3. Inputs & Forms

#### Input Standard
```tsx
<Input className="
  rounded-2xl
  border-white/20
  bg-white/5
  text-white
  placeholder:text-white/50
  focus:border-[#F2E94E]/50
  focus:ring-[#F2E94E]/20
" />
```

**Règles :**
- ✅ Toujours fond glassmorphic `bg-white/5`
- ✅ Border subtile `border-white/20`
- ✅ Focus accent jaune
- ✅ Placeholder discret `text-white/50`

### 4. Badges & Tags

#### Badge Status
```tsx
/* Actif */
<Badge className="rounded-full bg-green-500/20 text-green-300">
  Actif
</Badge>

/* Inactif */
<Badge className="rounded-full bg-red-500/20 text-red-300">
  Inactif
</Badge>

/* Info */
<Badge className="rounded-full bg-blue-500/20 text-blue-300">
  Information
</Badge>
```

**Règles :**
- ✅ Toujours `rounded-full`
- ✅ Format : `bg-{color}-500/20` + `text-{color}-300`
- ✅ Padding : `px-3 py-1`

---

## 🔄 Hover Effects & Animations

### Échelle de Subtilité

| Contexte | Scale | Usage |
|----------|-------|-------|
| **Micro (icônes)** | `1.05-1.1` | Icônes, petits boutons |
| **Subtil (cartes list)** | `1.01` | Liste items, cards dans list view |
| **Modéré (cartes grid)** | `1.02` | Cards en grid view, éléments interactifs |
| **Visible (hover cards)** | `1.03` | Rarement utilisé, pour emphase forte |

### Template Hover Parfait
```tsx
<div className="
  group                          /* Active les group-hover */
  transition-all                 /* Tout est animé */
  duration-300                   /* 300ms = sweet spot */
  hover:scale-[1.01]             /* Très subtil */
  hover:border-white/20          /* Border plus visible */
  hover:bg-white/10              /* Fond plus clair */
  hover:shadow-lg                /* Shadow apparaît */
  hover:shadow-white/5           /* Très subtile */
">
  {/* Éléments enfants peuvent utiliser group-hover: */}
  <div className="group-hover:bg-[#F2E94E]/30">
    Avatar
  </div>
</div>
```

### Règles d'Or pour les Animations
1. **300ms** = durée standard parfaite
2. **Scale max 1.02** pour les cartes
3. **Shadows subtiles** : `white/5` à `white/10` max
4. **Toujours smooth** : `transition-all`
5. **Group hover** : pour animer plusieurs éléments ensemble

---

## 📋 Vues Liste vs Grille

### Toggle Buttons Apple-Style
```tsx
<div className="flex items-center gap-1 rounded-2xl bg-white/5 p-1">
  <button
    className={cn(
      'rounded-xl p-2.5 transition-all duration-300',
      viewMode === 'list'
        ? 'bg-white/10 text-white shadow-lg shadow-white/10'
        : 'text-white/50 hover:text-white/70 hover:bg-white/5'
    )}
  >
    <List className="h-4 w-4" />
  </button>
  <button
    className={cn(
      'rounded-xl p-2.5 transition-all duration-300',
      viewMode === 'grid'
        ? 'bg-white/10 text-white shadow-lg shadow-white/10'
        : 'text-white/50 hover:text-white/70 hover:bg-white/5'
    )}
  >
    <LayoutGrid className="h-4 w-4" />
  </button>
</div>
```

### List View - Caractéristiques
- Layout : Vertical stack avec `space-y-3`
- Hover : `scale-[1.01]` (très subtil)
- Info : Horizontale, toutes les infos visibles
- Actions : Toujours visibles à droite

### Grid View - Caractéristiques
- Layout : Grid responsive `sm:grid-cols-2 lg:grid-cols-3`
- Hover : `scale-[1.02]` (un peu plus visible)
- Info : Verticale, centrée, avec icônes
- Actions : Apparaissent au hover (dropdown top-right)

**Règles :**
- ✅ Toujours proposer les deux vues pour les listes importantes
- ✅ Default = List view
- ✅ Persister le choix utilisateur (localStorage dans le futur)

---

## 🎭 Glassmorphism

### Niveaux de Glass

```tsx
/* Niveau 1 - Containers principaux */
bg-white/12 backdrop-blur-2xl

/* Niveau 2 - Éléments interactifs */
bg-white/5 backdrop-blur-xl

/* Niveau 3 - Hover states */
bg-white/10 backdrop-blur-2xl
```

### Borders Glass
```tsx
/* Default */
border border-white/15

/* Hover */
border border-white/20

/* Active/Focus */
border border-[#F2E94E]/50
```

**Règles :**
- ✅ Toujours combiner `bg-white/X` avec `backdrop-blur-Xl`
- ✅ Plus l'élément est interactif, moins il est opaque
- ✅ Borders toujours subtiles (`white/15` à `white/20`)

---

## 🎪 Avatars & Icônes

### Avatar Circulaire (Initiales)
```tsx
<div className="
  flex h-12 w-12
  items-center justify-center
  rounded-full
  bg-[#F2E94E]/20
  text-lg font-semibold
  text-[#F2E94E]
  transition-all duration-300
  group-hover:bg-[#F2E94E]/30
  group-hover:shadow-lg
  group-hover:shadow-[#F2E94E]/20
">
  AB
</div>
```

### Avatar Carré (Grid View)
```tsx
<div className="
  flex h-16 w-16
  items-center justify-center
  rounded-2xl
  bg-[#F2E94E]/20
  text-2xl font-bold
  text-[#F2E94E]
  shadow-lg shadow-[#F2E94E]/10
  transition-all duration-300
  group-hover:bg-[#F2E94E]/30
  group-hover:shadow-2xl
  group-hover:shadow-[#F2E94E]/20
">
  AB
</div>
```

**Tailles Standards :**
- Small : `h-8 w-8` + `text-sm`
- Default : `h-12 w-12` + `text-lg`
- Large : `h-16 w-16` + `text-2xl`

---

## 📱 Responsive Design

### Breakpoints Tailwind
```
sm: 640px   // Mobile landscape
md: 768px   // Tablet
lg: 1024px  // Desktop
xl: 1280px  // Large desktop
```

### Patterns Responsifs
```tsx
/* Grid responsive */
<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

/* Padding responsive */
<div className="p-4 md:p-6 lg:p-8">

/* Text responsive */
<h1 className="text-2xl md:text-3xl lg:text-4xl">
```

**Règles :**
- ✅ Mobile first (design pour mobile d'abord)
- ✅ Gaps toujours identiques sur tous breakpoints
- ✅ Grid : 1 col mobile, 2 col tablet, 3 col desktop

---

## ⚡ Performance & Optimisation

### Images & Assets
- Toujours lazy load : `loading="lazy"`
- Icônes : Lucide React (optimisé)
- Pas d'images lourdes dans les lists

### Animations
- Utiliser `transition-all` avec parcimonie
- Préférer `transition-transform` + `transition-colors` quand possible
- Éviter d'animer `width` ou `height`

---

## ✅ Checklist d'Implémentation

Avant de pousser du code UI, vérifier :

- [ ] Tous les boutons ont `rounded-2xl` ou plus
- [ ] Toutes les cards ont `rounded-[24px]` minimum
- [ ] Hover effects : scale max `1.02`
- [ ] Transitions : `duration-300` par défaut
- [ ] Shadows : toujours subtiles (`white/5` ou `white/10`)
- [ ] Glassmorphism : `bg-white/X` + `backdrop-blur-Xl`
- [ ] Textes : hiérarchie respectée (white, white/70, white/60, white/50)
- [ ] Responsive : mobile first, grids adaptatifs
- [ ] Icônes : taille cohérente (`h-4 w-4` ou `h-5 w-5`)
- [ ] States : default, hover, active, disabled bien définis
- [ ] Accessibilité : contraste suffisant, focus visible

---

## 🚫 Anti-Patterns à Éviter

### ❌ À NE JAMAIS FAIRE

```tsx
/* 1. Scale trop important */
hover:scale-[1.1]  // ❌ Trop agressif

/* 2. Transitions trop rapides */
duration-100  // ❌ Trop rapide

/* 3. Borders trop visibles */
border-white/50  // ❌ Trop opaque

/* 4. Shadows trop fortes */
shadow-white/30  // ❌ Trop visible

/* 5. Rounded insuffisant */
rounded-lg  // ❌ Pas assez arrondi (utiliser rounded-2xl min)

/* 6. Glassmorphism sans blur */
bg-white/10  // ❌ Sans backdrop-blur

/* 7. Couleurs pures */
bg-white  // ❌ Utiliser bg-white/X
text-black  // ❌ Utiliser text-white/X
```

### ✅ Versions Correctes

```tsx
/* 1. Scale subtil */
hover:scale-[1.01]  // ✅ Parfait pour list
hover:scale-[1.02]  // ✅ Parfait pour grid

/* 2. Transitions smooth */
duration-300  // ✅ Sweet spot

/* 3. Borders subtiles */
border-white/15  // ✅ Default
border-white/20  // ✅ Hover

/* 4. Shadows discrètes */
shadow-white/5   // ✅ Très subtil
shadow-white/10  // ✅ Subtil

/* 5. Rounded généreux */
rounded-2xl   // ✅ Boutons, inputs
rounded-[24px]  // ✅ Cards
rounded-[32px]  // ✅ Cards importantes

/* 6. Glassmorphism complet */
bg-white/10 backdrop-blur-2xl  // ✅

/* 7. Couleurs avec opacité */
bg-white/12  // ✅
text-white/70  // ✅
```

---

## 🎯 Exemples de Code Parfaits

### Card Interactive Parfaite
```tsx
<Card className="
  group
  cursor-pointer
  rounded-[24px]
  border border-white/10
  bg-white/5
  transition-all duration-300
  hover:scale-[1.01]
  hover:border-white/20
  hover:bg-white/10
  hover:shadow-lg
  hover:shadow-white/5
">
  <CardContent className="p-6">
    <div className="flex items-center gap-4">
      <div className="
        flex h-12 w-12
        items-center justify-center
        rounded-full
        bg-[#F2E94E]/20
        text-lg font-semibold
        text-[#F2E94E]
        transition-all duration-300
        group-hover:bg-[#F2E94E]/30
        group-hover:shadow-lg
        group-hover:shadow-[#F2E94E]/20
      ">
        AB
      </div>
      <div>
        <h3 className="font-medium text-white">
          Nom de l'élément
        </h3>
        <p className="text-sm text-white/60">
          Description
        </p>
      </div>
    </div>
  </CardContent>
</Card>
```

### Bouton CTA Parfait
```tsx
<Button className="
  rounded-2xl
  bg-[#F2E94E]
  px-6 py-6
  text-[#071427]
  font-medium
  transition-all duration-300
  hover:bg-[#F2E94E]/90
  hover:shadow-lg
  hover:shadow-[#F2E94E]/20
  active:scale-[0.98]
">
  <PlusCircle className="mr-2 h-5 w-5" />
  Action Principale
</Button>
```

### Input Parfait
```tsx
<Input
  type="email"
  placeholder="email@example.com"
  className="
    rounded-2xl
    border-white/20
    bg-white/5
    text-white
    placeholder:text-white/50
    focus:border-[#F2E94E]/50
    focus:ring-2
    focus:ring-[#F2E94E]/20
    transition-all duration-300
  "
/>
```

---

## 📊 Design Tokens (à implémenter)

### Spacing Scale
```
xs: 0.5rem   // 8px
sm: 0.75rem  // 12px
md: 1rem     // 16px
lg: 1.5rem   // 24px
xl: 2rem     // 32px
2xl: 3rem    // 48px
```

### Border Radius Scale
```
button: 16px     // rounded-2xl
card-sm: 24px    // rounded-[24px]
card-lg: 32px    // rounded-[32px]
avatar: 9999px   // rounded-full
```

---

## 🔮 Future Improvements

### En cours de réflexion
- [ ] Dark/Light mode toggle
- [ ] Thème customisable par entreprise
- [ ] Animations de chargement skeleton
- [ ] Micro-interactions (confetti, particles)
- [ ] Transitions de page
- [ ] Gestures mobile (swipe, etc.)

---

## 📚 Ressources

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev)
- [Radix UI](https://radix-ui.com)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines)

---

**Dernière mise à jour** : 2025-10-10

**Version** : 1.0.0

**Maintenu par** : Claude Code
