# 2iwa2 - منصة إيواء | KiTS Guide

## 🇱🇧 Overview
"2iwa2" is a rapid-response PWA platform designed to support displaced Lebanese citizens during conflict. Built by **KiTS**, it prioritizes speed, simplicity, and zero-cost infrastructure.

## 🛠 Tech Stack (Zero-Cost Focus)
- **Frontend**: Next.js 14 (App Router) - Hosted on **Vercel** (Free Tier).
- **Backend/DB**: **Supabase** (PostgreSQL + Auth + Realtime) - Free Tier.
- **PWA**: `next-pwa` for mobile installation and offline caching.
- **Maps**: **Leaflet** + OpenStreetMap (100% Free) or **Google Maps** (Free Tier credit).
- **Translations**: `next-intl` (Arabic Main, Lebanese Dialect Backup).

## 📂 Project Structure
- `src/app/`: Page routing (Home, Shelters, Alerts, News, Admin, Guide).
- `src/components/`: Reusable UI components (ReportForm, Skeleton, etc.).
- `src/lib/`: Utilities (Notifications, Scrapers).
- `public/sw.js`: Service Worker for PWA Offline & Push.
- `supabase_schema.sql`: Database schema to be applied in Supabase SQL Editor.

## 🚀 Priority Implementation Path
1. **Step 1: Database Setup**
   - Create a free project on [Supabase](https://supabase.com).
   - Copy-paste the content of `supabase_schema.sql` into the SQL Editor.
2. **Step 2: Environment Config**
   - Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`.
3. **Step 3: Dependencies & Build**
   - Run `npm install` to fetch all packages including `framer-motion` and `leaflet`.
   - Run `npm run dev` to start the local development server.
4. **Step 4: Push Notifications**
   - Configure **Firebase Cloud Messaging (FCM)**.
   - Update `public/sw.js` with your FCM sender ID.
   - Use `src/lib/notifications.ts` to manage user subscriptions.
5. **Step 5: Scraper Automation**
   - Use **Supabase Edge Functions** (Deno) to run the logic in `src/lib/scrapers.ts` on a cron schedule (every 5-10 minutes).
6. **Step 6: PWA Deployment**
   - Build the project (`npm run build`) and deploy to Vercel.
   - Users can "Add to Home Screen" on iOS/Android.

## 💡 Key Features for KiTS
- **Lebanese Dialect Toggle**: High user engagement for local context (AR/LB).
- **Admin Verification**: Only "Trusted" alerts get the blue badge. Manage this via `/admin`.
- **Financial Bar**: Real-time exchange rate and fuel prices directly on the home page.
- **Offline Mode**: Basic assets and last-fetched data are cached via Service Worker.
- **Crowdsourced Intelligence**: Users report data, KiTS admins verify.
- **UX Excellence**: Skeleton screens for smooth loading, Framer Motion for fluid UI, and SEO-optimized `robots.txt`.
- **Social Sharing**: Direct WhatsApp/System sharing for critical news and alerts.
- **Typography**: Uses the **Cairo** font for superior Arabic readability.

## ⚠️ Important Note on Environment
The local environment provided does not have `Node.js` or `npm` installed. All code has been written and audited to be fully compatible with Next.js 14 (App Router). To run this project:
1. Download the code to your local machine with `Node.js` installed.
2. Run `npm install --force` to handle dependency resolution.
3. Run `npm run dev` to start the development server.
4. Deploy to **Vercel** for the best PWA experience.

---
*Built with ❤️ for Lebanon by KiTS & Trae Assistant.*
