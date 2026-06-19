# Agent Odin demo UI

Standalone React + Vite + TypeScript interface for Odin's authenticated,
stateless programme-preview API. It does not add or alter backend contracts.

## Run locally

Start Odin from the repository root:

```bash
npm run dev:api
```

Then start the UI:

```bash
cd demo-ui
npm install
npm run dev
```

Open <http://localhost:5173/>.

By default, Vite proxies `/api` to `http://localhost:3000`. Override the backend
with `ODIN_API_PROXY_TARGET` for local proxying or
`VITE_ODIN_API_BASE_URL` for direct browser requests.

Copy `.env.example` to `.env.local` and add the public Supabase browser
configuration:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-or-publishable-key
```

The UI signs in with a development test user's email and password, lets
Supabase manage the browser session, optionally maps compatible fields from
GymX `user_profiles`, and sends the resulting access token with transient
athlete input to `POST /api/odin/preview`. Odin does not update the profile or
persist the generated programme. Never put the Supabase service-role key in
this project.
