# Bhupendra Singh Rathore — Design Portfolio

A portfolio of UI/UX, product design, and brand experience work by Bhupendra Singh Rathore.

**[View the live portfolio](https://bhup2009-gif.github.io/BhupendraPortfolio/)** · **[Read the Kyvos case study](https://bhup2009-gif.github.io/BhupendraPortfolio/projects-kyvos.html)**

> Behind every effortless experience are deliberate design decisions.
>
> I bring clarity to complex workflows through thoughtful UX and precise UI.

## Featured work

- **[CaféOS](https://cafeos-from-idea-to-launch.blitheelf66.chatgpt.site):** A café POS application designed and built from idea to a working local v1, covering ordering, kitchen handoffs, and billing.

- **Kyvos:** Website UX, brand guidelines, marketing campaigns, and event experiences connected through a consistent enterprise brand.
- **Talkbar:** A conversational AI assistant for website exploration.
- **Ethos Self-Custody Vault:** A self-custody crypto wallet experience.
- **Alfred:** A decentralized copy-trading application.
- **TXT2Create:** An AI product developed from concept through launch.

The portfolio also includes additional design explorations, independent tools, professional experience, and design writing.

## Built with

Static HTML, CSS, and vanilla JavaScript, hosted on GitHub Pages. No package installation or build step is required.

## Repository structure

| File | Purpose |
| --- | --- |
| `index.html` | Portfolio homepage |
| `about-me.html` | Background, experience, and skills |
| `projects-kyvos.html` | Kyvos case study with section navigation and reading progress |
| `projects-*.html` | Other project case studies |
| `local.css` | Shared portfolio styles and responsive layouts |
| `local.js` | Email copy action, navigation, and back-to-top interactions |
| `assets-*` | Project imagery and brand assets |
| `Bhupendra_Rathore_Resume.pdf` | Downloadable resume |
| `favicon.svg` | Site icon |
| `.nojekyll` | Serves the static site without Jekyll processing |

The Kyvos case study contains its own styles and reading-progress script within `projects-kyvos.html`.

## Preview locally

From the repository folder, start a static server:

```sh
python3 -m http.server 8000
```

Open [localhost:8000](http://localhost:8000/) in a browser. Check both desktop and mobile layouts before publishing changes.

## Update the portfolio

1. Edit `index.html` for hero copy, featured work, and homepage sections.
2. Edit the relevant `projects-*.html` file to update a case study.
3. Add original project visuals to the repository and reference them using relative paths.
4. Update `local.css` for shared styling and `local.js` for shared interactions.
5. Verify links, images, keyboard navigation, and mobile layouts.
6. Commit the changes to the branch configured for GitHub Pages.

Keep published project outcomes accurate and use approved artwork. The imported Kyvos case study currently presents its written narrative and logo; the source HTML's empty artwork placeholders were omitted from the public page.

## GitHub Pages publishing

This repository publishes the portfolio at:

**https://bhup2009-gif.github.io/BhupendraPortfolio/**

To review hosting configuration, open **Settings → Pages** in this repository. For branch-based publishing of these root-level static files, use **Deploy from a branch**, select **main**, and choose **/ (root)**.

After committing, check the **pages-build-deployment** run under **Actions**. Changes appear on the live site after deployment completes.

## Contact

- [Email](mailto:bhup2009@gmail.com)
- [LinkedIn](https://www.linkedin.com/in/bhupendra-rathore-b4b64588/)

## Ownership

Portfolio content and project visuals belong to their respective owners. Company names and logos are used to identify the work presented. No reuse license is granted by this README.

## Portfolio AI Concierge

A small bottom-right portfolio guide is integrated across the site. It supports sourced text chat, optional browser voice input/output, known-route navigation and section highlighting. It loads its knowledge and full UI only when opened and never starts the microphone or speech automatically. The free prototype uses 23 reviewed local knowledge records, not a paid model or API key.

See [setup, architecture, privacy, browser limitations and tests](docs/portfolio-ai-concierge.md).
