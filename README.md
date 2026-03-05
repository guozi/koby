# Koby

<p align="center">
  <img src="public/logo.svg" alt="Koby Logo" width="120" height="120">
</p>

<p align="center">
  <strong>A Clean & Efficient Bookmark Manager</strong>
</p>

<p align="center">
  <a href="./README_CN.md">中文文档</a>
</p>

---

Koby is a clean and efficient multi-user bookmark manager that helps you organize, categorize, and quickly access your important web bookmarks. It supports user registration, email verification, collection management, tagging, dark mode, and more. Data is stored on Cloudflare D1 and deployed on Vercel.

## Features

- **Authentication** — Email registration/login, JWT auth, email verification, password reset, multi-user data isolation
- **Collections** — Nested tree structure, custom emoji icons and colors, collection colors applied across bookmark cards
- **Bookmark Management** — Add, edit, delete, search, pin bookmarks with auto favicon & metadata fetching
- **Tagging** — Add tags to bookmarks (`#tag` style), filter by tags
- **Sharing** — One-click copy bookmark title and link to clipboard
- **Duplicate Detection** — Automatically detect existing URLs when adding bookmarks
- **View Modes** — Grid / List view with infinite scroll lazy loading
- **Global Search** — Ctrl+K / Cmd+K shortcut, dual-mode instant client-side + backend search
- **Bilingual** — Full Chinese / English support with one-click switching
- **Dark / Light Theme** — System auto-detection or manual toggle
- **Import / Export** — JSON and browser HTML bookmark formats
- **Responsive** — Desktop sidebar layout, mobile drawer menu
- **PWA** — Service Worker offline caching, installable as desktop app
- **Security** — Rate limiting, input validation, XSS protection, email normalization

## Quick Start

### Requirements

- Node.js >= 18
- Cloudflare D1 database
- Resend email service (for verification)

### Install

```bash
git clone <repo-url>
cd koby
npm install
```

### Configure

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

| Variable | Description |
| ---- | ---- |
| `CF_ACCOUNT_ID` | Cloudflare Account ID |
| `CF_D1_DATABASE_ID` | D1 Database ID |
| `CF_API_TOKEN` | Cloudflare API Token |
| `JWT_SECRET` | JWT signing secret (random string) |
| `CLIENT_URL` | Frontend URL (for CORS & verification emails) |
| `RESEND_API_KEY` | Resend API key |
| `RESEND_FROM` | Sender address (requires custom domain) |
| `VITE_API_URL` | Backend API URL (leave empty for Vercel) |

### Initialize Database

Run the SQL statements in `db/init-d1.sql` on the Cloudflare D1 console.

### Local Development

```bash
# Start both frontend and backend
npm run dev:all

# Or start separately
npm run dev      # Frontend (http://localhost:5173)
npm run server   # Backend (http://localhost:3001)
```

### Build & Deploy

```bash
npm run build
```

For Vercel deployment, configure environment variables in project settings. Leave `VITE_API_URL` empty, set `CLIENT_URL` to your actual domain.

## Tech Stack

**Frontend**: Vue 3 (Composition API) · Pinia · Vue Router · Tailwind CSS · Vite · Axios

**Backend**: Node.js · Express · Cloudflare D1 (SQLite) · JWT · bcryptjs · nanoid · Resend

**Deployment**: Vercel (Serverless Functions) · Cloudflare D1

## Project Structure

```text
koby/
├── api/index.js              # Vercel Serverless entry
├── db/init-d1.sql            # D1 database schema
├── server.js                 # Local dev server
├── server/
│   ├── db/database.js        # D1 database adapter
│   ├── middleware/auth.js     # JWT auth middleware
│   ├── routes/
│   │   ├── auth.js           # Auth routes (register/login/verify)
│   │   ├── bookmarks.js      # Bookmark routes (incl. search)
│   │   └── collections.js    # Collection routes
│   └── utils/
│       ├── bookmarkParser.js # HTML bookmark parser
│       ├── email.js          # Email sending
│       ├── favicon.js        # Favicon fetching
│       └── id.js             # nanoid unique ID generation
├── src/
│   ├── App.vue               # Root component (sidebar + topbar + search)
│   ├── router/index.js       # Frontend router + Auth Guard
│   ├── services/api.js       # API service layer
│   ├── i18n/index.js         # i18n translations (zh/en)
│   ├── utils/share.js        # Bookmark sharing utility
│   ├── stores/
│   │   ├── auth.js           # Auth state
│   │   ├── bookmarks.js      # Bookmarks/collections state (tree getter)
│   │   ├── theme.js          # Theme state
│   │   ├── locale.js         # Locale switching state
│   │   └── toast.js          # Toast notification state
│   ├── views/
│   │   ├── HomeView.vue      # Home (pinned + recent bookmarks)
│   │   ├── CollectionsView.vue # Collection management / detail
│   │   ├── AllBookmarksView.vue # All bookmarks browser
│   │   ├── LoginView.vue     # Login / Register
│   │   ├── VerifyEmailView.vue # Email verification
│   │   ├── ForgotPasswordView.vue # Forgot password
│   │   ├── ResetPasswordView.vue # Reset password
│   │   └── SettingsView.vue  # Settings (import/export)
│   └── components/           # Shared components
└── vercel.json               # Vercel deployment config
```

## API Endpoints

### Auth (no token required, rate limited)

| Method | Path | Description |
| ---- | ---- | ---- |
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/verify-email` | Verify email |
| POST | `/api/auth/resend-verification` | Resend verification email |
| POST | `/api/auth/forgot-password` | Send password reset email |
| POST | `/api/auth/reset-password` | Reset password |
| GET | `/api/auth/me` | Get current user (token required) |

### Bookmarks (token required)

| Method | Path | Description |
| ---- | ---- | ---- |
| GET | `/api/bookmarks` | Get all bookmarks |
| GET | `/api/bookmarks/search?q=` | Search bookmarks |
| GET | `/api/bookmarks/collection/:id` | Get bookmarks in collection |
| POST | `/api/bookmarks` | Add bookmark |
| PUT | `/api/bookmarks/:id` | Update bookmark |
| DELETE | `/api/bookmarks/:id` | Delete bookmark |
| POST | `/api/bookmarks/parse-html` | Parse HTML bookmark file |

### Collections (token required)

| Method | Path | Description |
| ---- | ---- | ---- |
| GET | `/api/collections` | Get all collections |
| GET | `/api/collections/:id` | Get single collection |
| POST | `/api/collections` | Add collection |
| PUT | `/api/collections/:id` | Update collection |
| DELETE | `/api/collections/:id` | Delete collection |

## Screenshots

<details>
  <summary><b>Light Mode</b></summary>
  <img src="public/img/light_mode.png" alt="Light Mode" width="100%">
</details>
<details>
  <summary><b>Dark Mode</b></summary>
  <img src="public/img/dark_mode.png" alt="Dark Mode" width="100%">
</details>
<details>
  <summary><b>Collections</b></summary>
  <img src="public/img/collection_1.png" alt="Collections" width="100%">
</details>

## License

[MIT](LICENSE)

## Sponsor

If you find Koby helpful, feel free to scan the QR code below to show your support:

<p align="center">
  <img src="public/img/sponsor-qrcode.png" alt="Sponsor QR Code" width="350" height="350">
</p>

---

Built with [Trae](https://www.trae.ai/)
