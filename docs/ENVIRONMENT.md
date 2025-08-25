# 🔧 Environment Variables - Planora

## Quick Setup

1. Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

2. Fill in your actual values in `.env.local`

---

## 📋 Required Variables

### 🌐 Next.js Configuration

| Variable              | Description      | Example                                                     |
| --------------------- | ---------------- | ----------------------------------------------------------- |
| `NODE_ENV`            | Environment mode | `development` / `production`                                |
| `NEXT_PUBLIC_APP_URL` | App base URL     | `http://localhost:3000` (dev) / `https://planora.io` (prod) |

### 🗄️ Supabase Configuration

| Variable                        | Description                | Where to find          |
| ------------------------------- | -------------------------- | ---------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL       | Project Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anonymous key       | Project Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY`     | Service role key (private) | Project Settings > API |

### 🤖 OpenAI Configuration

| Variable         | Description     | Where to find                        |
| ---------------- | --------------- | ------------------------------------ |
| `OPENAI_API_KEY` | OpenAI API key  | https://platform.openai.com/api-keys |
| `OPENAI_MODEL`   | AI model to use | `gpt-4` (recommended)                |

### 🔐 Authentication

| Variable          | Description           | How to generate               |
| ----------------- | --------------------- | ----------------------------- |
| `NEXTAUTH_SECRET` | Secret for JWT tokens | `openssl rand -base64 32`     |
| `NEXTAUTH_URL`    | Auth callback URL     | Same as `NEXT_PUBLIC_APP_URL` |

---

## 🔒 Optional Variables

### 📧 Email (SMTP)

Required for notifications and user invitations:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@planora.app
```

### 📊 Analytics & Monitoring

```env
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
SENTRY_DSN=https://your-sentry-dsn.ingest.sentry.io
```

### ⚡ Performance

```env
REDIS_URL=redis://localhost:6379
```

### 🐛 Development

```env
DEBUG=true
VERBOSE_LOGGING=true
```

---

## 🚨 Security Notes

### ✅ **Safe to commit** (in .env.example):

- Variable names and structure
- Example values
- Documentation

### ❌ **NEVER commit** (keep in .env.local only):

- Real API keys
- Database credentials
- Secret keys
- Production URLs with sensitive data

### 🛡️ **Best Practices**:

1. Use different keys for development and production
2. Rotate keys regularly
3. Use least-privilege principle for API keys
4. Monitor API usage and costs

---

## 🔍 Validation

The app will validate required environment variables on startup and show clear error messages for missing or invalid values.

### Check your configuration:

```bash
npm run build
```

If everything is configured correctly, the build should succeed without errors.

---

## 🌍 Environment-Specific Configs

### Development (.env.local)

```env
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
DEBUG=true
VERBOSE_LOGGING=true
```

### Production (Vercel/deployment platform)

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://planora.io
NEXTAUTH_URL=https://planora.io
DEBUG=false
VERBOSE_LOGGING=false
```

---

## ❓ Troubleshooting

### "Missing environment variable" error:

1. Check `.env.local` exists
2. Verify variable names match exactly
3. Restart development server after changes

### Supabase connection issues:

1. Verify URL format: `https://xxx.supabase.co`
2. Check keys are from correct project
3. Ensure RLS policies allow access

### OpenAI API errors:

1. Check API key is valid and active
2. Verify billing account has credits
3. Monitor rate limits and usage

---

Need help? Check the main [README.md](../README.md) or create an issue.
