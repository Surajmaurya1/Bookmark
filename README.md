# Smart Bookmark App

A real-time bookmark manager built with Next.js, Supabase, and Tailwind CSS.

## Features

- **Google Authentication**: Secure sign-in with Google.
- **Private Bookmarks**: Each user sees only their own bookmarks.
- **Real-time Updates**: Changes reflect instantly across tabs/devices.
- **Responsive Design**: Built with Tailwind CSS.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Styling**: Tailwind CSS
- **Code**: TypeScript

## Setup Instructions

### 1. Supabase Setup

1. Create a new project at [Supabase](https://supabase.com).
2. Go to the **SQL Editor** and run the contents of `supabase/schema.sql`.
3. Go to **Authentication > Providers** and enable **Google**.
4. Configure Google OAuth (Client ID & Secret) from Google Cloud Console.
   - Authorized Redirect URI: `https://<your-project>.supabase.co/auth/v1/callback`

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

\`\`\`bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
\`\`\`

### 3. Run Locally

\`\`\`bash
npm install
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000).

## Deployment on Vercel

1. Push code to GitHub.
2. Import project in Vercel.
3. Add Environment Variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
4. **Important**: Add your Vercel deployment URL (and `localhost:3000` for dev) to **Supabase > Authentication > URL Configuration > Site URL** and **Redirect URLs**.

## Architecture & Decisions

- **Supabase SSR**: Used `@supabase/ssr` for secure cookie-based session management in Next.js App Router.
- **Middleware**: Implemented to refresh sessions and protect routes.
- **Realtime**: Client-side subscription in `Dashboard.tsx` listens for `INSERT` and `DELETE` events on the `bookmarks` table.
- **RLS**: Row Level Security ensures data privacy at the database level.
