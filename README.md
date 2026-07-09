# Halosight Test Website Template

This is a static prototype built from the public Halosight website scrape and the site's AI-readable context files.

## Sources Reviewed

- `https://halosight.com/`
- `https://halosight.com/sitemap.xml`
- `https://halosight.com/robots.txt`
- `https://halosight.com/llms.txt`
- `https://halosight.com/ai-context.json`
- Production CSS bundle tokens from `https://halosight.com/assets/index-DfzKn3g7.css`
- Slide 3 from `/Users/troymott/Downloads/2026 07 10 - Halosight Introduction - Trudell (1).pptx`
- Slide 7 from `/Users/troymott/Downloads/2026 07 10 - Halosight Introduction - Trudell (1).pptx`

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

## Editing The Template

The page includes a lightweight browser-based editor:

- Click **Edit** in the bottom-right toolbar.
- Click any outlined text field and type directly on the page.
- Click the header logo or the hero image field to replace an image.
- Click **Add Text Box** to place a draggable text box in the currently visible section.
- Click **Add Image** to place a draggable image field in the currently visible section.
- Drag added objects by their **Move** handle while edit mode is on.
- Click **Save** to store edits in the current browser with `localStorage`.
- Click **Export HTML** to download a standalone edited HTML file.
- Click **Reset** to clear local saved edits and return to the committed template.

This editor is meant for fast website-copy and layout review, similar to editing slide fields. It does not publish changes back to GitHub automatically.

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
