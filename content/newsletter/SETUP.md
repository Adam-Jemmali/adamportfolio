# The Build Log — one time setup

The signup form on `/madajbuilds/` posts `{ email }` to `/api/subscribe`, a Vercel
serverless function (`api/subscribe.js`). That function talks to Resend. Nothing
works until the steps below are done.

## 1. Resend

1. Create a Resend account at https://resend.com
2. **Domains** → add `adamjemmali.me` (or a subdomain like `send.adamjemmali.me`).
   Add the DNS records Resend gives you at your registrar. Wait for "Verified".
3. **Audiences** → create one called "The Build Log". Copy its **Audience ID**.
4. **API Keys** → create a key with **Full access** (it needs Contacts + Emails).
   Copy it once, it is shown only that time.

## 2. Vercel environment variables

Project → **Settings → Environment Variables**. Add these for Production (and
Preview if you want to test on preview URLs):

| Name | Value |
| --- | --- |
| `RESEND_API_KEY` | the key from step 1.4 |
| `RESEND_AUDIENCE_ID` | the id from step 1.3 |
| `NEWSLETTER_FROM` | `The Build Log <hello@adamjemmali.me>` (must be your verified domain) |
| `OWNER_EMAIL` | your inbox, for future owner notices |

Redeploy after adding them.

## 3. Local testing (optional)

```
cp .env.example .env      # fill in the four RESEND_/NEWSLETTER_/OWNER_ vars
npx vercel dev            # runs the site AND the /api functions locally
```

Plain `npm run dev` runs the site only; the form then shows a "signups open in
production" fallback, which is expected.

## 4. Sending an issue

1. Draft in `content/newsletter/00X.md`, keep the quiz in sync with
   `src/madajbuilds/weeks.js` (add the week there and bump the `?w=` link).
2. Resend → **Broadcasts** → new broadcast → audience "The Build Log".
   Paste the issue (convert the Markdown to HTML). Resend adds the one click
   unsubscribe link automatically.
3. Send.

## Engagement numbers

`api/quiz-complete.js` logs one line per finished quiz. Vercel →
**Observability → Logs**, filter for `quiz-complete`. For a real running total,
add `@vercel/kv` and one `kv.incr` call in that file (noted in the code).
