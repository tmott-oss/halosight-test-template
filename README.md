# Halosight Test Website Template

This is a static prototype built from the public Halosight website scrape and the site's AI-readable context files.

## Sources Reviewed

- `https://halosight.com/`
- `https://halosight.com/sitemap.xml`
- `https://halosight.com/robots.txt`
- `https://halosight.com/llms.txt`
- `https://halosight.com/ai-context.json`
- Production CSS bundle tokens from `https://halosight.com/assets/index-DfzKn3g7.css`

## What This Template Preserves

- Dark hero with compact header, white logo treatment, coral primary CTA, and purple secondary CTA.
- Brand fonts: `Roboto Slab` for major headings and `Barlow` for body/UI text.
- Core palette: coral, purple, blue, teal, dark slate, and white/light slate sections.
- Public product story: meeting intelligence, field sales, commitment tracking, CRM sync, integrations, security, and demo conversion.

## How To Use

Open `index.html` directly in a browser, or serve the folder with any static server:

```bash
cd "/Users/troymott/Documents/New project/halosight-test-template"
python3 -m http.server 5174
```

Then visit `http://localhost:5174`.

The template is self-contained for static hosting. The logo lives at `assets/halosight-color-logo.png`.

## Deploy With GitHub Pages

Option A: deploy this folder from the `main` branch.

1. Push this project to GitHub.
2. In GitHub, open the repository settings.
3. Go to **Pages**.
4. Set source to **Deploy from a branch**.
5. Choose branch `main` and folder `/halosight-test-template`.
6. Save. GitHub will publish a URL like `https://YOUR-USER.github.io/YOUR-REPO/`.

Option B: create a dedicated repo where `index.html`, `styles.css`, `script.js`, and `assets/` sit at the repository root. Then set Pages to deploy from `main` and `/root`.

## Suggested Next Iterations

- Split sections into route-level pages for `/pricing`, `/security`, `/blog`, and `/contact`.
- Replace placeholder pricing with current packaging once the offer is finalized.
- Add a real form endpoint or CRM capture step.
- Add customer proof, screenshots, or product demo media when available.
- Keep `llms.txt`, `ai-context.json`, JSON-LD, and page metadata in sync with the final messaging.
