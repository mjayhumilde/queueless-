<p align="center">
  <img src="public/queueLessLogo.png" alt="QueueLess logo" width="160" />
</p>

<h1 align="center">QueueLess</h1>

QueueLess helps you manage queues online. Create a queue, share a link, and let
participants track their number in real time.

**Currently in alpha, with sandbox payments for testing.**

## Features

- Sign in with Google.
- Create queues and share join links.
- Join a queue using a link or queue ID.
- Call the next participant, skip, reset, or delete a queue.
- Display the current and next numbers on a live monitor.
- Test Business and Pro upgrades through PayMongo GCash checkout.

## Tech stack

Next.js, React, TypeScript, Tailwind CSS, Firebase Authentication,
Firebase Realtime Database, and PayMongo.

## Getting started

Requires Node.js 20.9 or newer, npm, and a Firebase project.

1. Install dependencies:

   ```bash
   npm ci
   ```

2. Copy [.env.example](.env.example) to `.env.local` and fill in your Firebase
   settings. For payment testing, also configure `FIREBASE_DB_SECRET` and a
   PayMongo `sk_test_` secret key. Keep `.env.local` out of version control.

3. Enable Google sign-in in Firebase Authentication, add `localhost` to its
   authorized domains, and configure your Realtime Database access rules.

4. Start the app:

   ```bash
   npm run dev
   ```

Open [localhost:3000](http://localhost:3000). Restart the server after changing
environment variables.

## Sandbox payments

Open `/pricing`, choose Business or Pro, and complete the GCash test checkout.
Return using the same browser and account to verify the payment and apply the
plan. Each purchase grants 30 days of access; automatic renewal is not enabled.

For webhook testing, register `checkout_session.payment.paid` at
`/api/paymongo/webhook` using a public HTTPS URL and configure
`PAYMONGO_WEBHOOK_SECRET`. Local return-page verification works without a tunnel.

Firebase rules must protect plan fields from client writes before live payments
are enabled.

## Commands

```bash
npm run dev         # Development server
npm run build       # Production build
npm start           # Run the production build
npm run lint        # Lint
npx tsc --noEmit    # Type check
```
