# Rahmani Malabre - Personal Portfolio

Personal portfolio of Rahmani (AZARIAH) Malabre, Applied AI and Data Science.

- Live Vercel site: https://project-utamo.vercel.app
- Source: https://github.com/r-azariah/portfolio
- Intended custom domain: https://rahmanimalabre.dev
- Vercel project: portfolio, under rahmalabre-7656s-projects.
- Production branch: main. Vercel automatically deploys pushed commits.

## Edit with Codex

Open this repository folder in Codex and describe the change. The current desktop checkout is C:/Users/rahma/Downloads/rahmanimalabre-website. Ask for a local preview before publishing substantial changes.

Source files:

| File | Purpose |
| --- | --- |
| index.html | Home page metadata, styling and script loading |
| app.jsx | Home page React components, orbit and interactions |
| glyphs.jsx | Logo artwork |
| tweaks-panel.jsx | Design preview controls |
| CV.html | Curriculum vitae page |
| Projects.html | Project portfolio page |
| resume.pdf | Downloadable resume |
| robots.txt / sitemap.xml | Search-engine discovery |

The site is static HTML and JSX, using pinned React 18 and Babel CDN scripts. No dependency installation or build step is required. Use the root source files; do not maintain another deploy/ copy.

## Local preview

With Node.js installed, run from this folder:

```powershell
node scripts/preview.cjs
```

Open http://127.0.0.1:4173. Stop the preview with Ctrl+C.

## Publish changes

Review the diff, check the affected pages and resume link, then commit and push to main. The existing Vercel GitHub integration deploys it automatically; no manual ZIP upload is needed.

```powershell
git pull --ff-only
git status
git diff
git add <changed-files>
git commit -m "Describe the portfolio change"
git push origin main
```

For a larger change, use a branch and pull request to get a Vercel preview before merging. Never commit .vercel/ or .env credentials.

## Custom-domain recovery

On 2026-10-03, DNS for rahmanimalabre.dev returned verify-contact-details.namecheap.com and failed-whois-verification.namecheap.com. This indicates a Namecheap registrant contact-verification hold. The Vercel site remains available at its vercel.app URL.

The owner needs to complete the domain contact-verification email in Namecheap. If necessary, use Domain List > Verify Contacts to request the email again. Then allow DNS to recover and check the domain in Vercel > portfolio > Settings > Domains. Do not buy another domain or change nameservers merely to bypass the verification hold.

Namecheap instructions: https://www.namecheap.com/support/knowledgebase/article.aspx/10698/46/what-to-do-if-my-domain-was-suspended-due-to-whois-verification-process/
