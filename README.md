# Asif Raza — Video Editor & Colorist Portfolio (Full-Stack)

A complete, production-ready portfolio website crafted specifically for **Asif Raza** (Video Editor & Colorist), strictly matching the visual design, spacing, layout, and dark-and-orange theme (`#121212` matte black + vibrant `#FD6F00` orange gradient accent) of the design screenshot.

---

## 🌟 Key Features

1. **Pixel-Perfect Hero Section (Exact Match to Figma Design):**
   - **Left Column:** Intro greeting (`Hi I am`), Sub-heading in off-white (`Asif Raza`), and oversized bold title in vibrant orange gradient (`Video Editor & Colorist`).
   - Circular dark-outlined social buttons with orange hover glow (Instagram, YouTube, LinkedIn, Behance).
   - Side-by-side Dual CTAs: Solid orange `Hire Me` button + Outlined `Download CV` button.
   - Docked Stats Card: 3 dynamic metrics separated by thin vertical dividers (`2+ Years Experience`, `50+ Projects Done`, `20+ Happy Clients` — fetched from backend).
   - **Right Column:** Large subtle dark circular backdrop (`#1A1A1A`) centered behind a high-contrast cutout portrait.

2. **Full Portfolio Sections:**
   - **Services (`#services`):** 3-column dark cards with orange hover borders covering *Video Editing*, *Color Grading*, and *Post-Production & Sound*.
   - **About Me (`#about`):** Professional narrative, certified software badges (DaVinci Resolve Studio, Premiere Pro, After Effects, ACES, Audition), and CV download.
   - **Portfolio Projects (`#portfolio`):** Filter tabs (`All`, `Reels & Shorts`, `Commercial / YouTube`, `Color Grading`), video thumbnail cards with retention/views metrics, and a sleek **Lightbox Video Player** supporting YouTube, Vimeo, and MP4.
   - **Interactive Before & After Color Grading Slider:** Showcase cards where visitors can drag a vertical orange divider handle across RAW/LOG sensor footage vs. the final graded look in real-time (touch and mouse support).
   - **Contact / Hire Me (`#contact`):** Dark inquiry form with direct submission to MongoDB, instant loading state, and toast feedback.

3. **Secure Admin Dashboard (`/admin.html`):**
   - Protected by JWT authentication (`POST /api/auth/login`).
   - Add, edit, and delete **Portfolio Projects** (video URLs, thumbnails, metrics, featured toggle).
   - Add, edit, and delete **Color Grading Comparisons** (before/after images, camera specs, look notes).
   - Update **Hero Stats** (`experienceYears`, `projectsDone`, `happyClients`) and URLs (portrait & CV).
   - View, filter, and manage **Client Inquiries** (mark as read/replied, delete).

---

## 📁 Project Architecture

The repository is structured into two independent directories for seamless split deployment:

```
Portfolio Asif/
├── client/                     # Frontend (Static HTML5/CSS3/Vanilla JS) -> Deployed on Netlify
│   ├── index.html              # Main Portfolio Page
│   ├── admin.html              # Admin Dashboard
│   ├── css/
│   │   ├── style.css           # Design Theme & Responsive Styles
│   │   └── admin.css           # Admin Dashboard Styles
│   ├── js/
│   │   ├── config.js           # API_BASE_URL (Local vs Render)
│   │   ├── app.js              # Portfolio interactions, slider, modal, inquiry form
│   │   └── admin.js            # Admin Auth, CRUD operations
│   ├── assets/
│   │   ├── images/             # Cutout portrait, grading comparisons, project thumbs
│   │   └── docs/               # Resume / CV PDF
│   ├── _redirects              # Netlify SPA & clean route redirects
│   └── netlify.toml            # Netlify build & security headers
│
├── server/                     # Backend API (Node.js, Express, MongoDB Atlas) -> Deployed on Render
│   ├── config/
│   │   └── db.js               # MongoDB connection handler with offline fallback
│   ├── models/
│   │   ├── Project.js          # Project Mongoose schema
│   │   ├── ColorGrade.js       # Color grading comparisons schema
│   │   ├── Inquiry.js          # Client inquiry submissions schema
│   │   └── SiteSettings.js     # Hero stats, bio, links schema
│   ├── routes/
│   │   ├── auth.js             # POST /api/auth/login, GET /api/auth/me
│   │   ├── projects.js         # Public GET, Protected POST/PUT/DELETE
│   │   ├── colorGrades.js      # Public GET, Protected POST/PUT/DELETE
│   │   ├── settings.js         # Public GET, Protected PUT
│   │   └── inquiries.js        # Public POST, Protected GET/PUT/DELETE
│   ├── middleware/
│   │   └── auth.js             # JWT verification middleware
│   ├── dataStore.js            # Resilient data layer (Atlas + local persistence)
│   ├── seed.js                 # Seed database script
│   ├── server.js               # Express application entrypoint
│   ├── .env.example            # Environment variables template
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🚀 1. Running Locally

### Step 1: Start the Backend Server
```bash
cd server
npm install
npm run seed      # Seeds sample video projects, color grade comparisons, and hero stats
npm start         # Runs server on http://localhost:5000
```
> **Note:** If no `MONGO_URI` is provided, the server automatically initializes a local persistent file database (`server/data/local-db.json`), allowing full offline testing with zero configuration!

### Step 2: Open the Frontend
You can open `client/index.html` directly in your browser, or serve it with any local static server:
```bash
cd client
npx serve .
# Or simply double-click client/index.html in Finder
```

### Default Admin Credentials:
- **URL:** Open `http://localhost:5000/admin.html` (or `http://localhost:3000/admin.html`)
- **Email:** `admin@asifraza.com`
- **Password:** `Wickcr789*`

---

## 🍃 2. Connecting MongoDB Atlas (Production Database)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free shared cluster (`M0`).
2. Under **Database Access**, create a user (e.g., `asif_admin`) and password.
3. Under **Network Access**, click **Add IP Address** -> Select **Allow Access from Anywhere** (`0.0.0.0/0`).
4. In your Cluster Overview, click **Connect** -> **Drivers** (Node.js) -> Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/asif_portfolio?retryWrites=true&w=majority
   ```
5. Place this URI in your `server/.env` file:
   ```env
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/asif_portfolio?retryWrites=true&w=majority
   ```
6. Populate Atlas with initial data:
   ```bash
   cd server
   npm run seed
   ```

---

## ☁️ 3. Deploy Backend to Render

1. Push your repository to GitHub.
2. Sign in to [Render Dashboard](https://dashboard.render.com).
3. Click **New +** -> **Web Service**.
4. Connect your GitHub repository.
5. Configure the service settings:
   - **Root Directory:** `server`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
6. Add Environment Variables under **Environment**:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `MONGO_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A secure random secret key (e.g. `asif_raza_jwt_production_2026`)
   - `ADMIN_EMAIL`: Your admin email (e.g. `admin@asifraza.com`)
   - `ADMIN_PASSWORD`: Your chosen secure password
   - `CLIENT_URL`: `https://your-netlify-subdomain.netlify.app`
7. Click **Deploy Web Service**.
8. Once deployed, copy your Render Web Service URL (e.g., `https://asif-portfolio-server.onrender.com`). Verify via `https://asif-portfolio-server.onrender.com/api/health`.

---

## ⚡ 4. Deploy Frontend to Netlify

### Option A: Via GitHub (Recommended)
1. Sign in to [Netlify](https://app.netlify.com).
2. Click **Add new site** -> **Import an existing project**.
3. Select your GitHub repository.
4. Set Build Settings:
   - **Base directory:** `client`
   - **Publish directory:** `client` (or leave as `.` if Base directory is set to `client`)
   - **Build command:** *(leave empty)*
5. Click **Deploy Site**.

### Option B: Link Netlify to Render Backend
Open `client/js/config.js` and set your Render URL:
```javascript
const CONFIG = {
  API_BASE_URL: (() => {
    if (window.PORTFOLIO_API_URL) return window.PORTFOLIO_API_URL;
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '') {
      return 'http://localhost:5000';
    }
    // Set to your live Render backend URL:
    return 'https://asif-portfolio-server.onrender.com';
  })(),
};
```
Commit and push. Netlify will auto-deploy the changes!

---

## 🛡️ API Endpoints Summary

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | Render health check / uptime status |
| `POST` | `/api/auth/login` | Public | Admin login; returns JWT token |
| `GET` | `/api/auth/me` | Protected | Verify active session |
| `GET` | `/api/projects` | Public | Fetch video projects (supports `?category=...`) |
| `POST` | `/api/projects` | Protected | Create new project |
| `PUT` | `/api/projects/:id` | Protected | Update project |
| `DELETE` | `/api/projects/:id` | Protected | Delete project |
| `GET` | `/api/color-grades` | Public | Fetch before/after color grading comparisons |
| `POST` | `/api/color-grades` | Protected | Create color grade comparison |
| `PUT` | `/api/color-grades/:id` | Protected | Update color grade comparison |
| `DELETE` | `/api/color-grades/:id`| Protected | Delete color grade comparison |
| `GET` | `/api/settings` | Public | Fetch hero stats, bio, and social links |
| `PUT` | `/api/settings` | Protected | Update hero stats, bio, and contact info |
| `POST` | `/api/inquiries` | Public | Submit project inquiry |
| `GET` | `/api/inquiries` | Protected | List client inquiries |
| `PUT` | `/api/inquiries/:id` | Protected | Update inquiry status (`new`, `replied`) |
| `DELETE` | `/api/inquiries/:id`| Protected | Delete client inquiry |

---

## 🎨 Theme Specifications

- **Primary Background:** `#121212` (Matte Black)
- **Card Surface:** `#1B1B1B` / `#1E1E1E` (Dark Charcoal)
- **Primary Accent:** `linear-gradient(90deg, #FD6F00 0%, #E46400 100%)` (Vibrant Orange Gradient)
- **Primary Text:** `#FAFAFA`
- **Secondary Text:** `#959595` / `#707070`
- **Dividers & Borders:** `#2A2A2A` / `rgba(255, 255, 255, 0.12)`
- **Typography:** Headings: *Plus Jakarta Sans* (600, 700, 800) | Body & Buttons: *Inter* (400, 500, 600)
