# @inbetween/web

Next.js 16 (App Router) web app. Arabic is the default locale and renders right-to-left.

- `src/app/[locale]/`: pages per locale (`/ar`, `/en`)
- `src/i18n/`: next-intl routing, request config and navigation helpers
- `src/proxy.ts`: locale detection and redirects (Next 16 proxy, formerly middleware)
- `messages/{ar,en}.json`: all UI strings; keys are type-checked against `en.json`
- `src/lib/api.ts`: server-side API client (degrades gracefully when the API is down)

Rules:

- Use logical Tailwind utilities (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`), never `left`/`right`.
- No hard-coded user-facing text; add keys to both message files.
- Money arrives as strings of minor units; format with `formatMoney` from `@inbetween/shared/money`.
- No business rules here: they belong in the API or `@inbetween/shared`.
