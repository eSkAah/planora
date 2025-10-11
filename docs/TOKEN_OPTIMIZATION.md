# 🔋 Gestion des Tokens - Optimisation

## ❓ Pourquoi j'atteins la limite rapidement ?

### Le Problème

Chaque conversation accumule **tout l'historique** dans le contexte :
- Tous les messages précédents
- Tous les fichiers lus (`Read` tool)
- Toutes les réponses générées
- Les system reminders

**Exemple concret** :
```
Message 1: "Créer magic links"
→ Je lis 10 fichiers (5000 tokens)
→ Je réponds (2000 tokens)
→ Total cumulé: 7000 tokens

Message 2: "Ajouter UI premium"
→ Contexte précédent: 7000 tokens
→ Je lis 5 nouveaux fichiers (3000 tokens)
→ Je réponds (2000 tokens)
→ Total cumulé: 12000 tokens

Message 3: "Appliquer à toute l'app"
→ Contexte précédent: 12000 tokens
→ Je lis 8 fichiers (4000 tokens)
→ Je réponds (2000 tokens)
→ Total cumulé: 18000 tokens
```

**Après 3-4 messages**, on peut facilement atteindre **50 000 - 80 000 tokens** !

Avec des fichiers volumineux comme :
- `employees/page.tsx` : ~920 lignes = ~8 000 tokens
- `Sidebar.tsx` : ~170 lignes = ~1 500 tokens

---

## 🎯 Solutions d'Optimisation

### 1. **Résumer la Conversation** (Recommandé)

Quand le contexte devient trop lourd, demande :
```
"Peux-tu résumer la conversation ?"
```

Cela crée un **snapshot compact** de tout ce qui a été fait, réduisant drastiquement les tokens.

**Avant** :
- 50 000 tokens (messages complets + fichiers)

**Après résumé** :
- 5 000 tokens (résumé structuré)

---

### 2. **Éviter de Relire les Mêmes Fichiers**

#### ❌ Inefficace
```
Prompt: "Modifie le dashboard"
→ Je relis employees/page.tsx (8k tokens)
→ Je relis dashboard/page.tsx (3k tokens)
→ Je modifie

Prompt: "Ajoute une couleur"
→ Je relis dashboard/page.tsx ENCORE (3k tokens)
→ Je modifie
```

#### ✅ Efficace
```
Prompt: "Modifie le dashboard et ajoute une couleur en une fois"
→ Je lis dashboard/page.tsx UNE FOIS (3k tokens)
→ Je fais les 2 modifs
```

**Conseil** : Regroupe plusieurs demandes similaires en un seul prompt.

---

### 3. **Sois Spécifique sur les Fichiers**

#### ❌ Vague
```
"Améliore l'UI de l'app"
```
→ Je vais lire TOUS les fichiers pour comprendre

#### ✅ Spécifique
```
"Améliore l'UI du dashboard uniquement"
```
→ Je lis seulement dashboard/page.tsx

---

### 4. **Utilise des Glob Patterns Précis**

#### ❌ Large
```tsx
pattern: "**/*.tsx"
```
→ Retourne 100+ fichiers

#### ✅ Ciblé
```tsx
pattern: "src/app/(app)/*/page.tsx"
```
→ Retourne seulement les pages principales

---

### 5. **Décompose les Grandes Tâches**

#### ❌ Tout en un
```
"Applique l'UX premium à toute l'app, ajoute magic link login,
fixe le dashboard, documente tout, et optimise les perfs"
```
→ Je dois lire 20+ fichiers = 50k+ tokens

#### ✅ Par étapes
```
Session 1: "Fixe le dashboard onboarding"
Session 2: "Ajoute magic link login"
Session 3: "Applique UX premium au dashboard"
Session 4: "Applique UX premium aux settings"
```

---

### 6. **Nouvelle Conversation pour Nouveau Contexte**

Si tu changes complètement de sujet, démarre une nouvelle conversation :

**Contexte A** : Authentification & Magic Links
**Contexte B** : UI/UX & Design System

→ 2 conversations séparées = moins de tokens par conversation

---

## 📊 Budget de Tokens

Limite actuelle : **200 000 tokens**

### Consommation Typique

| Action | Tokens | Exemple |
|--------|--------|---------|
| **Message simple** | 100-500 | "Bonjour, continue" |
| **Lire fichier court** | 1 000-2 000 | Sidebar.tsx (170 lignes) |
| **Lire fichier moyen** | 3 000-5 000 | Dashboard (260 lignes) |
| **Lire fichier long** | 8 000-12 000 | Employees (920 lignes) |
| **Réponse courte** | 500-1 000 | Confirmation simple |
| **Réponse longue** | 2 000-5 000 | Explication + code |
| **Documentation** | 5 000-10 000 | Guide complet |

### Scénarios

#### Scénario Rapide ⚡ (20k tokens)
```
1. Prompt: "Fixe le bug X dans le fichier Y"
2. Je lis Y (2k)
3. Je réponds (2k)
4. Tu valides
→ Total: ~5k tokens
→ Peut faire 40 rounds !
```

#### Scénario Moyen 📊 (100k tokens)
```
1. Prompt: "Améliore l'UX des employés"
2. Je lis employees/page.tsx (8k)
3. Je lis components (5k)
4. Je modifie (3k)
5. Je documente (5k)
→ Total: ~25k tokens par feature
→ Peut faire 4-5 features
```

#### Scénario Lourd 🔥 (200k tokens)
```
1. Prompt: "Applique UX à toute l'app"
2. Je lis 10 pages (50k)
3. Je lis 20 composants (30k)
4. Je modifie tout (40k)
5. Je documente (20k)
6. On itère 2-3 fois
→ Total: ~180k tokens
→ Proche de la limite !
```

---

## 🛠️ Stratégies Pratiques

### Stratégie 1 : Itération Courte

```bash
# Session 1 (30k tokens)
"Fixe dashboard onboarding"
→ Résumé

# Session 2 (25k tokens)
"Ajoute magic link login"
→ Résumé

# Session 3 (40k tokens)
"Applique UX au dashboard et settings"
```

**Avantages** :
- ✅ Contexte toujours frais
- ✅ Plus rapide
- ✅ Moins de risque d'erreur

### Stratégie 2 : Batch par Domaine

```bash
# Session "Auth" (80k tokens)
- Magic links employés
- Magic links admins
- Tests E2E auth
→ Résumé

# Session "UI/UX" (80k tokens)
- Doc guidelines
- Premium effects
- List/Grid toggles
→ Résumé

# Session "Features" (80k tokens)
- Dashboard stats
- Onboarding steps
- Activity feed
```

---

## 🎓 Best Practices

### DO ✅

1. **Résume régulièrement**
   - Tous les 3-5 échanges complexes
   - Quand tu sens que ça ralentit

2. **Sois précis**
   - Nomme les fichiers exacts
   - Décris clairement ce que tu veux

3. **Regroupe les modifs**
   - "Fais A, B et C dans ce fichier"
   - Au lieu de 3 prompts séparés

4. **Utilise les docs**
   - Je peux référencer `docs/UX_GUIDELINES.md`
   - Au lieu de tout ré-expliquer

### DON'T ❌

1. **Évite les prompts trop larges**
   - "Améliore tout" = je lis tout

2. **Ne demande pas de relire**
   - Si je viens de lire un fichier
   - Fais les modifs en une fois

3. **Ne surcharge pas**
   - 10 demandes en un prompt = confusion
   - Mieux vaut 3 prompts ciblés

---

## 📈 Monitoring

### Indices que la limite approche :

1. **Messages ralentissent**
   - Chaque réponse prend plus de temps

2. **Réponses plus courtes**
   - Je commence à compresser

3. **Contexte perdu**
   - J'oublie des détails mentionnés avant

4. **Warning "Token budget"**
   - Système affiche un avertissement

### Que faire ? 🆘

```
Option 1: "Résume la conversation"
→ Continue dans la même session

Option 2: Nouvelle conversation
→ Référence les docs créés
→ Donne un bref contexte
```

---

## 🎯 Exemple Optimisé

### ❌ Inefficace (200k tokens)

```
Prompt 1: "Explique-moi toute l'architecture"
→ Je lis 50 fichiers (80k tokens)

Prompt 2: "Maintenant améliore l'UX partout"
→ Je relis tout + modifie (100k tokens)

Prompt 3: "Documente tout ça"
→ Contexte saturé (20k tokens restants)
```

### ✅ Efficace (60k tokens)

```
Prompt 1: "Lis UX_GUIDELINES.md et améliore dashboard/page.tsx"
→ Je lis 2 fichiers (10k tokens)
→ Je modifie (5k tokens)

Prompt 2: "Applique la même logique à settings/company/page.tsx"
→ Je lis 1 fichier (5k tokens)
→ Je modifie (5k tokens)

Prompt 3: "Résume les changements dans un doc"
→ Je documente (10k tokens)

Total: 35k tokens = Budget restant de 165k !
```

---

## 🔧 Outils d'Optimisation

### 1. Résumés Réguliers
```
"Résume la conversation"
ou
"Fais un checkpoint"
```

### 2. Documentation Externe
Créer des docs pour ne pas répéter :
- `UX_GUIDELINES.md` ✅ (créé)
- `ARCHITECTURE.md` (à créer)
- `API_PATTERNS.md` (à créer)

### 3. Commentaires de Code
Documenter directement dans le code :
```tsx
/**
 * Premium card with Apple-style hover effects
 * Scale: 1.02, Duration: 300ms, Shadow: white/10
 * @see docs/UX_GUIDELINES.md
 */
```

---

## 📚 TL;DR

**Problème** : Contexte accumule tous les fichiers lus + messages

**Solutions** :
1. ✅ Résume tous les 3-5 échanges
2. ✅ Sois spécifique sur les fichiers
3. ✅ Regroupe les demandes similaires
4. ✅ Utilise les docs comme référence
5. ✅ Nouvelle conversation si changement de contexte

**Impact** :
- Sans optimisation : 3-4 prompts = limite
- Avec optimisation : 15-20 prompts = limite

---

**Dernière mise à jour** : 2025-10-10
