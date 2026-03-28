# OutreachPilot

This is a Next.js app for generating networking outreach templates.

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template:

```bash
cp .env.example .env.local
```

3. Start development:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Sharing this project safely

Do **not** share your real `.env` file or API keys. Share only code plus `.env.example`.

- Without `OPENAI_API_KEY`, the template API automatically runs in local demo mode and returns usable sample templates.
- Without Clerk keys, auth/pricing UI is disabled and the app still runs in demo mode.
- Add real keys in `.env.local` only when you want full API + billing behavior.

## Environment variables

See `.env.example`:

- `OPENAI_API_KEY` (optional): enables live OpenAI template generation.
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (optional): enables Clerk auth widgets.
- `CLERK_SECRET_KEY` (optional): enables Clerk server-side features.
