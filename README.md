# CareSphere Website — Setup Guide

## Project Structure

```
caresphere/
├── index.html              Homepage
├── about.html              About Us
├── services.html           Services (+ dynamic from admin)
├── community.html          Community Programs (+ dynamic events)
├── resources.html          Health Resources (+ dynamic from admin)
├── impact.html             Impact
├── blog.html               Blog (static + dynamic admin posts)
├── blog-post.html          Blog post detail (Firestore)
├── resource-article.html   Resource article detail (Firestore)
├── members.html            Team + Partners (+ dynamic from admin)
├── contact.html            Contact (Formspree)
├── privacy.html            Privacy Policy
├── terms.html              Terms of Use
│
├── admin/
│   ├── setup.html          ⚠️ One-time admin registration
│   ├── login.html          Admin login + password reset
│   ├── index.html          Dashboard (analytics overview)
│   ├── blogs.html          Blog posts CRUD
│   ├── events.html         Events CRUD
│   ├── services.html       Services CRUD
│   ├── resources.html      Health Resources CRUD
│   ├── team.html           Team Members CRUD
│   ├── analytics.html      Full analytics dashboard
│   └── admin.css           Admin styles
│
├── api/
│   └── imagekit-auth.js    Vercel serverless — ImageKit signing
│
├── js/
│   ├── firebase.js         Shared Firebase config
│   ├── tracker.js          Analytics tracker (runs on every public page)
│   └── imagekit.js         ImageKit upload helper (admin only)
│
├── css/style.css           Public site styles
├── images/                 Logo, team photos, etc.
├── vercel.json             Vercel deployment config
└── firestore.rules         Firestore security rules
```

---

## 1. First-Time Setup

### Firebase Console
1. Go to https://console.firebase.google.com → Project: **carespher**
2. Enable **Authentication → Email/Password**
3. Go to **Firestore → Rules** → paste contents of `firestore.rules` → Publish
4. Create these Firestore indexes:
   - `blogs`: `status ASC, createdAt DESC`
   - `events`: `status ASC, eventDate ASC`
   - `resources`: `status ASC, createdAt DESC`
   - `services`: `status ASC, order ASC`
   - `analytics_daily`: `date DESC`

### Create Admin Account
1. Deploy the site (see below)
2. Visit `https://your-domain.com/admin/setup.html`
3. Fill in your name, email, password
4. Secret key: **CARESPHERE_SETUP_2025**
5. After setup, **delete or restrict access to `admin/setup.html`**

### ImageKit
- Your ImageKit URL endpoint should be: `https://ik.imagekit.io/caresphere`
- If different, update `IMAGEKIT_URL_ENDPOINT` in `vercel.json` and in `api/imagekit-auth.js`

---

## 2. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# From project root
vercel

# Set environment variable (NEVER put private key in code)
vercel env add IMAGEKIT_PRIVATE_KEY
# Enter: private_BTxr6AfJxsmM7gjrrO9aHcadDAI=
```

Or via Vercel Dashboard:
- Settings → Environment Variables
- Add: `IMAGEKIT_PRIVATE_KEY` = `private_BTxr6AfJxsmM7gjrrO9aHcadDAI=`

---

## 3. Firestore Collections Reference

| Collection           | Used For              | Key Fields |
|---------------------|-----------------------|------------|
| `blogs`             | Blog posts            | title, category, content, excerpt, coverUrl, status, slug, tags, author, createdAt |
| `events`            | Community events      | title, type, eventDate, eventTime, location, audience, description, coverUrl, registrationLink, status |
| `services`          | Services              | title, icon, category, description, details, ctaText, order, status |
| `resources`         | Health resources      | title, category, type, summary, content, coverUrl, status |
| `team_members`      | Team / members page   | firstName, lastName, role, bio, email, photoUrl, linkedIn, twitter, order, comingSoon |
| `admin_users`       | Admin whitelist       | uid, email, firstName, lastName, role |
| `analytics_pages`   | Per-page view counts  | page, views, lastSeen |
| `analytics_daily`   | Daily visit totals    | date, visits |
| `analytics_referrers` | Traffic sources     | referrer, count |

---

## 4. How Dynamic Content Works

- **Public pages load static content first** (always visible, fast)
- **Firestore content loads silently** after page load
- If Firestore is empty or has an error → static content shows as normal
- Once admin publishes content → it automatically appears on the relevant page

| Admin publishes...  | Appears on...                     |
|--------------------|-----------------------------------|
| Blog post          | `blog.html` (new section) + `blog-post.html` |
| Event              | `community.html` (new section) + `index.html` |
| Service            | `services.html` (new section)     |
| Health resource    | `resources.html` (new section) + `resource-article.html` |
| Team member        | `members.html` (replaces static grid) |

---

## 5. Formspree Contact Form
Replace `YOUR_FORM_ID` in `contact.html` with your actual Formspree form ID:
```
action="https://formspree.io/f/YOUR_FORM_ID"
```
Get your form ID at https://formspree.io

---

## 6. Analytics
Analytics are automatically collected from every public page visit via `js/tracker.js`.
View them in the admin panel: `/admin/analytics.html`

No third-party analytics service needed — all data stored in your own Firestore.
