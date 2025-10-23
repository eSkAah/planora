# Tests du Service Email

Ce document explique comment tester le service d'email avec Resend.

## 🔑 Configuration

La clé API Resend est déjà configurée dans `.env.local` :
```bash
RESEND_API_KEY=re_GcmoWezn_QH6ffc2Ky115UZ6R7xRX8SSG
```

## ✅ Tests disponibles

### 1. Test Manuel Rapide

Envoyez un email de test à votre adresse :

```bash
npx tsx scripts/test-email.ts votre-email@example.com
```

**Exemple :**
```bash
npx tsx scripts/test-email.ts test@planora.app
```

**Ce que ça fait :**
- Envoie un email de bienvenue avec un magic link de test
- Utilise le vrai template `WelcomeEmployeeEmail`
- Vérifie que Resend fonctionne correctement

### 2. Tests Unitaires (Jest)

Lancez les tests unitaires du service email :

```bash
npm test -- src/lib/services/__tests__/email.test.ts
```

**Note :** Ces tests nécessitent la clé API Resend configurée.

### 3. Tests E2E (Playwright)

Testez le flux complet de création d'employé avec magic link :

```bash
# Lancer tous les tests E2E
npm run test:e2e

# Lancer uniquement les tests de magic link
npx playwright test e2e/employees/magic-link.spec.ts

# Mode debug
npx playwright test e2e/employees/magic-link.spec.ts --debug
```

## 📧 Vérification des emails envoyés

### Option 1 : Resend Dashboard

1. Allez sur https://resend.com/emails
2. Connectez-vous avec votre compte
3. Vous verrez tous les emails envoyés avec leur statut

### Option 2 : Logs de l'application

Les logs du service email affichent :
- ✅ Succès : `✅ Email sent successfully: [email_id]`
- ❌ Erreur : `❌ Error sending email: [error]`
- ⚠️ Warning : Si l'email échoue mais l'employé est créé

## 🧪 Tester le flux complet

### Dans l'application (manuel)

1. Démarrez le serveur : `npm run dev`
2. Connectez-vous en tant qu'admin
3. Allez sur `/employees`
4. Cliquez sur "Nouvel employé"
5. Remplissez le formulaire avec une vraie adresse email
6. Soumettez le formulaire
7. Vérifiez :
   - ✅ Toast : "Un email avec un lien de connexion a été envoyé à..."
   - ✅ Pas de dialogue de mot de passe temporaire
   - ✅ L'employé apparaît dans la liste
   - ✅ Email reçu dans la boîte de réception

### Template de l'email

L'email envoyé contient :
- **Sujet** : "Bienvenue chez [CompanyName] - Accédez à votre compte Planora"
- **Contenu** :
  - Message de bienvenue personnalisé
  - Bouton "Accéder à mon compte" (jaune `#F2E94E`)
  - Info : Lien valide 24h, usage unique
  - Footer avec nom de l'entreprise

## 🐛 Debugging

### L'email ne part pas ?

**Vérifiez :**
1. La clé API est bien configurée : `echo $RESEND_API_KEY` ou vérifiez `.env.local`
2. Le serveur a bien rechargé la config : Redémarrez `npm run dev`
3. Les logs du serveur : Cherchez les messages d'erreur

**Erreurs communes :**

- `RESEND_API_KEY cannot be empty` → Clé API manquante dans `.env.local`
- `Module not found: '@react-email/render'` → Lancez `npm install`
- `401 Unauthorized` → Clé API invalide
- `Email service not configured` → RESEND_API_KEY non définie

### L'email arrive en spam ?

**C'est normal en test !**

Raisons :
- Email de test envoyé depuis Resend (pas votre domaine)
- Contenu générique
- Lien localhost dans l'email

**En production :**
- Configurez votre domaine dans Resend
- Ajoutez les enregistrements DNS (SPF, DKIM, DMARC)
- Utilisez des liens vers votre domaine de production

## 📊 Limites Resend

**Tier gratuit :**
- ✅ 100 emails par jour
- ✅ 1 domaine vérifié
- ✅ API complète

**Suffisant pour :**
- Tests
- Développement
- MVP
- ~3000 emails/mois

## 🚀 Prochaines étapes

1. **Vérifier le domaine** : Configurez votre domaine personnalisé dans Resend
2. **Ajouter analytics** : Tracking des ouvertures/clics
3. **Templates avancés** : Notifications, rappels, etc.
4. **Tests automatisés** : Intégrer les tests dans la CI/CD

## 📝 Scripts utiles

```bash
# Test rapide
npx tsx scripts/test-email.ts votre-email@example.com

# Tests unitaires
npm test -- email.test

# Tests E2E
npm run test:e2e

# Voir les logs en direct
tail -f .next/trace # ou console du serveur
```

## 🔗 Ressources

- [Resend Documentation](https://resend.com/docs)
- [React Email Components](https://react.email/docs/components/button)
- [Supabase Magic Links](https://supabase.com/docs/guides/auth/auth-magic-link)
