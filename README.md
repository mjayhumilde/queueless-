<p align="center">
  <img src="public/queueLessLogo.png" alt="QueueLess logo" width="160" />
</p>

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Sandbox payments

Copy `.env.example` to `.env.local` and fill in the Firebase project settings and
PayMongo test credentials. Restart the dev server after changing environment
variables. The Realtime Database URL is named
`NEXT_PUBLIC_FIRE_BASE_DATABASE_URL` in both the client and payment server.
`FIREBASE_DB_SECRET` must authorize server reads and writes to that database;
keep it and both PayMongo secrets server-only.

To test, sign in, open `/pricing`, select Business or Pro, and complete the
GCash sandbox checkout. Return to QueueLess in the same browser. The success
page checks the saved checkout session with PayMongo and applies the plan only
after confirming a paid PHP payment for the signed-in account and selected
price. Navbar and pricing listen for the saved plan automatically. If activation
fails, the page displays the error and lets you retry without buying again.

This return flow works on localhost without a webhook tunnel. Redirect URLs use
the origin that started checkout, so a local purchase returns to the local app.
Each checkout has its own return reference and a cookie lasting 24 hours, so
checkouts in different tabs do not overwrite one another. Start a fresh sandbox
checkout after updating from the old integration, since older checkouts did not
save this cookie.

For activation even when the customer closes the checkout tab, register and
enable a PayMongo webhook for `checkout_session.payment.paid` at
`https://<your-public-host>/api/paymongo/webhook`. Use a public HTTPS tunnel to
test webhook delivery locally; PayMongo cannot call localhost directly. Set
`PAYMONGO_WEBHOOK_SECRET` to that endpoint's signing secret. A disabled webhook
or a webhook pointing at another deployment will not update the local handler.
The handler verifies the test/live signature and returns a failure response if
the plan cannot be saved, allowing delivery retries.

Each purchase grants 30 days from PayMongo's payment timestamp. Refreshing the
success page or receiving the same webhook again does not extend that period.
These are one-time checkout payments; automatic monthly renewal is not configured.

Before accepting live payments, restrict Firebase client writes to the payment
fields (`plan`, `planExpiry`, `planPaidAt`, and `paymongoPaymentId`). An owner-wide
write rule at `users/$uid` also grants writes to these children; a child-level
deny does not override that grant. This repository does not deploy database rules.

Run payment regression checks with `npm test`. The checks mock PayMongo/Firebase
and do not charge a payment or change a real account.

API references: [PayMongo checkout sessions](https://docs.paymongo.com/reference/checkout-session-resource),
[webhook signatures](https://docs.paymongo.com/docs/developer-tools-webhook-setup-management),
and [Firebase conditional writes](https://firebase.google.com/docs/database/rest/save-data#section-conditional-requests).

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
