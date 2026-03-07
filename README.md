# Koby

<p align="center">
  <img src="public/logo.svg" alt="Koby Logo" width="120" height="120">
</p>

<p align="center">
  <strong>A self-hosted bookmark manager with a built-in developer toolbox</strong>
</p>

<p align="center">
  <a href="./README_CN.md">中文文档</a>
</p>

---

Koby is a clean and efficient self-hosted bookmark manager for individuals and small teams. Organize, categorize, and access your web bookmarks with ease. It comes with a built-in developer toolbox featuring 21 handy utilities — all running in the browser, no data leaves your machine.

## Features

### Bookmark Management
- **Collections** — Nested tree structure with custom emoji icons and colors
- **Tagging** — Add `#tag` style tags to bookmarks, filter by tags
- **Global Search** — `Ctrl+K` / `Cmd+K` shortcut, instant client-side + backend search
- **Duplicate Detection** — Auto-detect existing URLs when adding bookmarks
- **Pin & Share** — Pin important bookmarks, one-click copy title + link
- **Import / Export** — JSON and browser HTML bookmark formats
- **View Modes** — Grid / List view with infinite scroll

### Developer Toolbox (21 tools)

All tools run entirely in the browser with zero server requests.

| Tool | Description |
| ---- | ---- |
| JSON Formatter | Format, minify, and validate JSON |
| Base64 Codec | Encode / decode Base64 strings |
| URL Codec | Encode / decode URL strings |
| Timestamp | Convert between Unix timestamps and dates |
| UUID Generator | Generate random UUIDs in bulk |
| Color Converter | Convert between HEX, RGB, and HSL |
| Word Counter | Count characters, words, and lines |
| Hash Generator | Compute SHA-1/256/384/512 hashes |
| Regex Tester | Test regular expressions online |
| Text Diff | Compare two texts line by line |
| Date Calculator | Calculate date differences and offsets |
| SQL Formatter | Format and minify SQL statements |
| Code Beautifier | Syntax highlight code and export as image |
| Lorem Ipsum | Generate placeholder text |
| JWT Decoder | Decode JWT tokens, inspect header/payload, check expiry |
| Properties ↔ YAML | Convert between Properties and YAML formats |
| Cron Expression | Parse cron with human-readable descriptions + next 5 runs |
| HTTP Status Codes | Searchable reference for all HTTP status codes |
| Radix Converter | Real-time BIN/OCT/DEC/HEX conversion |
| Markdown Preview | Live side-by-side Markdown editor and preview |
| QR Code Generator | Generate QR codes from text or URLs, download as PNG |

### Platform
- **Authentication** — Email registration/login, JWT auth, email verification, password reset
- **Bilingual** — Full Chinese / English support with one-click switching
- **Dark / Light Theme** — System auto-detection or manual toggle
- **Browser Extension** — One-click save from any page with AI tag suggestions
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
├── browser-extension/        # Chrome extension for one-click saving
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
│   ├── i18n/                 # i18n translations (zh/en)
│   ├── composables/          # Shared composables (useToolHelper, etc.)
│   ├── stores/               # Pinia stores (auth, bookmarks, theme, locale, toast)
│   ├── views/
│   │   ├── HomeView.vue      # Home (pinned + recent bookmarks)
│   │   ├── CollectionsView.vue # Collection management / detail
│   │   ├── AllBookmarksView.vue # All bookmarks browser
│   │   ├── ToolboxView.vue   # Developer toolbox (21 tools)
│   │   ├── SettingsView.vue  # Settings (import/export)
│   │   └── ...               # Login, verify, password reset views
│   └── components/
│       └── tools/            # 21 tool components (ToolJson, ToolJwt, etc.)
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

## Sponsor

If you find Koby helpful, consider supporting the project:

<p align="center">
  <a href="https://ko-fi.com/X8X31VJQ3E">
    <img src="https://ko-fi.com/img/githubbutton_sm.svg" alt="Support me on Ko-fi" />
  </a>
</p>

## License

[MIT](LICENSE)

---

Built with [Trae](https://www.trae.ai/)
