# Trip Splitter – Short Clean Links (Cloudflare Worker)

Shared links become short and clean:

```
https://your-name.workers.dev/t/abc12345
```

No more long ugly `#eyJ...` links in WhatsApp.

---

## 1. Create KV storage (one-time)

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **KV**
2. Click **Create a namespace**
3. Name it: `TRIP_STORE`
4. Click Create

## 2. Create / Edit your Worker

1. Go to **Workers & Pages** → Create Application → Create Worker
2. Name it (e.g. `trip-splitter`)
3. Click **Deploy** (you can replace the code later)
4. Open the Worker → **Settings** → **Variables** → **KV Namespace Bindings**
5. Add binding:
   - Variable name: `TRIP_STORE`
   - KV namespace: the one you created (`TRIP_STORE`)
6. Save

## 3. Paste the code

1. Open the Worker → **Edit code**
2. Delete everything and paste the entire content of `worker.js`
3. Click **Save and Deploy**

## 4. Done

Your app is live at:

```
https://YOUR-WORKER-NAME.YOUR-SUBDOMAIN.workers.dev
```

### How it works now

- Create a trip → gets a short ID
- Share link looks like: `https://….workers.dev/t/abc12345`
- WhatsApp message is clean and short
- Data is stored in Cloudflare KV (free tier is enough)
- Trips automatically expire after 90 days

### Testing

1. Open the worker URL
2. Create a trip with 2 members + mobile numbers
3. Save → Share card appears
4. Copy the short link or use WhatsApp / SMS buttons
5. Open the short link on another phone → pick your name → add expenses

---

## Optional: Custom domain

In the Worker settings you can add a custom domain (e.g. `split.yourdomain.com`).
