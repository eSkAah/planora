# Guide de Test - Planora

## 🧪 Tests E2E (End-to-End)

### Vue d'ensemble

Les tests E2E utilisent **Playwright** pour tester l'application complète, de la création de compte jusqu'à l'utilisation des fonctionnalités.

### ✨ Caractéristiques

- ✅ **Nettoyage automatique** : Toutes les données de test sont supprimées automatiquement
- ✅ **Isolation complète** : Chaque test crée ses propres données
- ✅ **Base de données propre** : Suppression de la DB publique ET de Supabase Auth
- ✅ **Scripts de vérification** : Outils pour vérifier l'état de la base

### 📝 Commandes disponibles

```bash
# Exécuter tous les tests E2E
npm run test:e2e

# Interface graphique interactive
npm run test:e2e:ui

# Mode "headed" (voir le navigateur)
npm run test:e2e:headed

# Mode debug
npm run test:e2e:debug

# Nettoyage manuel des données de test
npm run test:e2e:clean

# Vérifier que la DB est propre
npm run test:e2e:verify

# Statistiques de la base de données
npm run db:stats
```

### 🔄 Cycle de vie des tests

1. **Avant les tests** : Les tests démarrent avec une base propre
2. **Pendant les tests** : Chaque test crée son propre compte et ses données
3. **Après les tests** : Le `globalTeardown` supprime automatiquement :
   - Les entreprises de test (identifiées par nom)
   - Les utilisateurs (public.users)
   - Les employés
   - Les contrats
   - Les plannings et assignments
   - Les shifts (table legacy)
   - Les utilisateurs dans Supabase Auth

### 🧹 Nettoyage des données

#### Automatique

Le nettoyage est **automatique** après chaque exécution de tests grâce au `globalTeardown`.

#### Manuel

Si vous devez nettoyer manuellement :

```bash
# Nettoyage complet (sans confirmation)
npm run test:e2e:clean

# Vérifier le résultat
npm run test:e2e:verify
```

#### Comment ça fonctionne ?

Le système identifie les comptes de test par des **patterns de noms** :

- `Test`
- `E2E`
- `Workflow`
- `Dashboard`
- `Planning`
- `Leaves`
- `Schedule`
- `Form`
- `Empty`
- `AI`
- `Company ` (suivi d'un timestamp)

**Important** : Tous vos tests doivent utiliser ces patterns dans les noms d'entreprise !

### 📊 Rapports

#### Rapport de nettoyage

Après chaque nettoyage, un rapport détaillé est affiché :

```
✅ Cleanup completed successfully!
📈 Deletion summary:
   - Companies: 164
   - Users (database): 174
   - Users (auth): 174
   - Employees: 2
   - Contracts: 0
   - Schedules: 0
   - Schedule Assignments: 0
   - Shift Templates: 0
   - Legacy Shifts: 52
```

#### Vérification de la base

```bash
npm run db:stats
```

Affiche :

```
📊 Database Statistics

📈 Total Records:
   Companies: 1
   Users: 2
   Employees: 1
   Contracts: 1
   Schedules: 0
   Schedule Assignments: 0
   Shift Templates: 0

🧪 Test Data:
   Test Companies: 0
   ✅ No test data found
```

### 🎯 Bonnes pratiques

#### 1. Nommage des comptes de test

```typescript
// ✅ BON - sera nettoyé
const timestamp = Date.now();
const companyName = `Test Company ${timestamp}`;
const userEmail = `test${timestamp}@example.com`;

// ❌ MAUVAIS - ne sera pas nettoyé
const companyName = `My Company ${timestamp}`;
```

#### 2. Timestamps obligatoires

Utilisez toujours `Date.now()` pour éviter les conflits entre tests :

```typescript
const timestamp = Date.now();
const companyName = `E2E Test ${timestamp}`;
const userEmail = `user${timestamp}@example.com`;
```

#### 3. Isolation des tests

Chaque test doit :

- Créer son propre compte
- Ne pas dépendre d'autres tests
- Tester ses fonctionnalités de manière isolée

### 🔧 Configuration

#### Variables d'environnement requises

Pour le nettoyage complet (incluant Supabase Auth) :

```env
# .env.local
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
NEXT_PUBLIC_SUPABASE_URL="https://..."
SUPABASE_SERVICE_ROLE_KEY="..." # Clé admin pour supprimer les users
```

#### Playwright Config

Le nettoyage automatique est configuré dans `playwright.config.ts` :

```typescript
export default defineConfig({
  // ...
  globalTeardown: require.resolve('./e2e/global-teardown'),
  // ...
});
```

### 🐛 Dépannage

#### Les données ne sont pas nettoyées

1. Vérifiez que le nom de l'entreprise contient un pattern de test
2. Vérifiez que `globalTeardown` est configuré dans `playwright.config.ts`
3. Lancez le nettoyage manuel : `npm run test:e2e:clean`

#### Erreurs de clés étrangères

Si vous obtenez des erreurs `Foreign key constraint violated` :

1. L'ordre de suppression est important (shifts → assignments → schedules → etc.)
2. Vérifiez que toutes les tables sont gérées dans `global-teardown.ts`

#### Base de données saturée

Si la base contient beaucoup de données de test :

```bash
# Nettoyage complet
npm run test:e2e:clean

# Vérification
npm run test:e2e:verify
```

### 📚 Structure des fichiers

```
e2e/
├── auth/                    # Tests d'authentification
├── dashboard/               # Tests du dashboard
├── employees/               # Tests des employés
├── leaves/                  # Tests des congés
├── planning/                # Tests de planification
├── schedules/               # Tests des horaires
├── settings/                # Tests des paramètres
├── workflow/                # Tests de workflows complets
├── forms/                   # Tests de validation de formulaires
├── global-teardown.ts       # Nettoyage automatique ✨
└── README.md                # Documentation détaillée

scripts/
├── cleanTestData.ts         # Nettoyage manuel
├── verifyCleanup.ts         # Vérification du nettoyage
└── dbStats.ts               # Statistiques de la DB
```

### 🎓 Ressources

- [Documentation Playwright](https://playwright.dev/)
- [Guide E2E complet](./e2e/README.md)
- [Playwright Config](./playwright.config.ts)

### 🆘 Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs de nettoyage
2. Lancez `npm run db:stats` pour voir l'état actuel
3. Utilisez `npm run test:e2e:clean` pour forcer le nettoyage
4. Consultez la documentation dans `e2e/README.md`
