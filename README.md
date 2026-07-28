# A Little Gift, Whiskers & All 🐾

A blue, cat-themed digital gift:
- An envelope + letter animation that plays every time the site loads
- A polaroid-style cat photo carousel ("A Few Good Cats")
- A "Leave a Little Note" corkboard, backed by MongoDB Atlas, so messages people leave are saved for next time

Plain HTML/CSS/JS on the front end, one small Node serverless function for the API, ready to deploy on Vercel.


## 1. Project structure

```
cat-gift/
├── api/
│   └── messages.js      # GET/POST notes — Vercel serverless function
├── index.html
├── style.css
├── script.js
├── package.json
├── vercel.json
├── .env.example
└── .gitignore
```

## 2. Set up MongoDB Atlas

1. In Atlas, make sure your cluster ("sandbox") allows connections from anywhere (Network Access → Add IP → `0.0.0.0/0`), since Vercel's serverless functions don't have a fixed IP.
2. Build your connection string with your **new** password:
   ```
   mongodb+srv://kennethsianghio756_db_user:<new-password>@sandbox.rj1ahhe.mongodb.net/purrfect_gift?retryWrites=true&w=majority
   ```
   The database name (`purrfect_gift` above) can be anything — the API will create the `notes` collection automatically the first time someone leaves a note.

## 3. Run locally (optional)

```bash
npm install
cp .env.example .env
# edit .env and paste your real connection string into MONGODB_URI
npx vercel dev
```

`vercel dev` runs both the static site and the `/api/messages` function locally, the same way Vercel runs them in production.

## 4. Deploy to Vercel

1. Push this folder to a GitHub repo (the `.gitignore` already excludes `.env` and `node_modules`, so your password won't be committed).
2. In Vercel: **New Project** → import that repo.
3. Before the first deploy, go to **Project Settings → Environment Variables** and add:
   | Name | Value |
   |---|---|
   | `MONGODB_URI` | your full `mongodb+srv://...` connection string with the new password |
4. Deploy. Vercel will serve `index.html`/`style.css`/`script.js` as static files and run `api/messages.js` as a serverless function at `/api/messages`.

## 5. Make it yours

- **Photos:** the carousel currently uses hand-drawn cat illustrations (inline SVG in `index.html`, inside `.slide` elements) so the gift works right out of the box without needing any images. To use real photos of your own cat instead, replace a `<figure class="slide">…</figure>` block with:
  ```html
  <figure class="slide">
    <span class="peg" aria-hidden="true">📌</span>
    <div class="polaroid">
      <img src="images/your-photo.jpg" alt="" class="cat-art" style="object-fit:cover;aspect-ratio:240/220;" />
      <figcaption>your caption</figcaption>
    </div>
  </figure>
  ```
  and drop the image file next to `index.html` (e.g. in a new `images/` folder).
- **Wording:** the hero title/subtitle and letter text live near the top of `index.html` — search for `hero-title` and `letter-title`.
- **Colors:** every color is a CSS variable at the top of `style.css` under `:root` (`--midnight`, `--royal`, `--sky`, `--powder`, `--paper`, `--gold`).

## How the note-saving works

- `GET /api/messages` returns the most recent 50 notes from the `notes` collection, newest first.
- `POST /api/messages` with JSON body `{ "name": "...", "message": "..." }` inserts a note (message is required, max 500 characters; name defaults to "A secret admirer").
- The front end (`script.js`) loads notes on page load and appends new ones instantly after posting, without a full page reload.
