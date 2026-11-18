# carbonpocket.app
Website for Carbon Pocket

Deploy this site with the Cloudflare Workers static-assets configuration in
`wrangler.jsonc` (for example, run `node scripts/build-pages.mjs` followed by
`npx wrangler deploy`). The build creates `public/` from an explicit allowlist;
Wrangler serves only that directory. The GitHub Actions workflow also builds
and publishes only `public/`. Set the repository's Pages source to **GitHub
Actions** before its first deployment.

The root `_headers` file sets security response headers for hosts that support
that convention, including the Cloudflare Workers static-assets deployment.
GitHub Pages does not apply `_headers`, so publishing through Pages alone
cannot add `X-Frame-Options`, `nosniff`, or CSP response headers. To get those
headers on the custom domain, serve the site through Cloudflare (or another
host/proxy that supports response-header rules); do not treat a checked-in
`_headers` file as protection on GitHub Pages.

Este projeto NUNCA executa drizzle-kit push. Migrações são aplicadas
manualmente no Neon, com SQL revisado.

## Public contributor grouping

Paid one-time checkouts and monthly/annual Stripe invoices are stored in Neon
as separate idempotent payment rows and linked to one contributor profile.
Matching uses an HMAC of the normalized email-and-name pair; raw email is not
stored in the contributor tables or returned by the public API. Only purchases
with explicit name-publication consent are linked to a public profile. The API
aggregates the stored payments into totals, active streaks, and plan badges.
Monthly payments count in their paid month; annual invoices use the Stripe
service period to credit the covered months to the streak.

Before using the ledger:

1. In the Neon SQL Editor, select the production database and run
   `scripts/add-contributor-ledger.sql`. This migration is additive and
   idempotent; do not use `drizzle-kit push`.
2. Set `CONTRIBUTOR_IDENTITY_SECRET` in the Vercel Production environment.
   Keep it stable; rotating it creates different profile identities.
3. Ensure Vercel Production has its existing `STRIPE_SECRET_KEY` and
   `DATABASE_URL` values. Historical imports run inside Vercel and do not
   require Stripe or Neon credentials on a local computer.
4. Generate a temporary random key of at least 32 bytes, set it as
   `CONTRIBUTOR_BACKFILL_KEY` in Vercel Production, and deploy. From the
   checked-out repository, run
   `.\scripts\run-vercel-contributor-backfill.ps1` in PowerShell and enter the
   same temporary key at the secure prompt. The PowerShell script only sends
   authenticated batch requests; Stripe and database access stay in Vercel.
   The job is idempotent and can safely be restarted if interrupted.
5. If an old paid one-time checkout has no public-consent metadata, the bulk
   backfill keeps it anonymous. Only after the buyer explicitly opts in, use
   `.\scripts\link-historical-checkout.ps1` to verify that specific paid
   Checkout Session and link it to the supplied public display name. Run this
   only for the buyer's own checkout. Enter its `cs_live_...` Checkout Session
   ID and the approved public name in PowerShell; never share the ID or email
   in chat.
6. After `CONTRIBUTOR_LEDGER_BACKFILL_COMPLETE` and any authorized manual
   linking, remove
   `CONTRIBUTOR_BACKFILL_KEY` from Vercel and redeploy to disable the temporary
   endpoint. The script imports paid checkouts and invoices; it does not send
   email or print customer addresses.

## Contribution receipt emails

The Stripe webhook sends the Brevo transactional template after an attestation
is created and uses its send-once guard when Stripe retries an event. Before
deploying the code:

1. Apply `scripts/add-receipt-email-columns.sql` to the production PostgreSQL
   database.
2. The authoritative receipt template is Brevo template **#4**. Its dark-mode
   HTML lives in Brevo; the local
   `carbonpocket-calculator/email/recibo-compensacao-brevo.html` file is not
   the published template and is not a deployment source. Update template #4
   by pasting the reviewed local HTML before relying on its icon layout. Its
   parameters are `nome`, `badge_usuario`, `emissao_kg`, `email`, and
   `codigo_registro`; `badge_usuario` is now an absolute badge-image URL or an
   empty value. The code also sends `plano`, which template #4 does not render
   today.
3. Set `BREVO_API_KEY`, `BREVO_TEMPLATE_ID`, and `BREVO_SENDER_EMAIL` in the
   Vercel environment for the webhook deployment. `BREVO_SENDER_NAME` is
   optional.
4. To send a real test, use a fresh, unreversed attestation from your own test
   purchase and the matching inbox you control:
   `node scripts/test-receipt-email.js --code CP-YYYY-XXXXXXXX --email you@example.com`.
   The test attempts the send once, then calls the idempotency guard again and
   verifies that `receipt_email_sent_at` did not change.

The test command sends a real email and claims that attestation for delivery.
Do not use a customer's live purchase for this test: the receipt will be sent
to the supplied address, and a successfully sent or ambiguous delivery will
not be sent again.
