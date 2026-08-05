# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Personal portfolio + blog for Danniel Navas (danniel.dev), built with Astro 5 (SSG, no client-side framework) and Tailwind CSS 4. Spanish (`es`) is the default/primary language; English (`en`) is available under `/en/`.

## Commands

Package manager is pnpm (`pnpm-lock.yaml` is the committed lockfile).

```sh
pnpm install       # install dependencies
pnpm dev           # start dev server at localhost:4321
pnpm build         # build to ./dist/
pnpm preview       # preview the production build locally
pnpm astro check   # type-check .astro files
node scripts/validate-contrast.js   # validate WCAG AA/AAA contrast of hardcoded colors used across the site
```

There is no test suite and no linter configured.

## Architecture

**Rendering model**: Everything is static Astro components (`.astro`), no islands/client frameworks. Pages fetch data at build time in the component frontmatter (the `---` fenced section).

**Blog content source**: Blog posts are NOT stored in this repo. They are fetched at build time from the dev.to API for user `dannieldev` (`src/services/posts.ts`: `getPostDevto()`, `getPostDevtoBySlug()`). This means:
- `src/pages/blog/[slug].astro` uses `getStaticPaths()` to pre-render one page per dev.to article, filtering slugs through `isValidSlug()` (`src/utils/validation.ts`) to skip anything that looks like a static asset path.
- Article Markdown bodies (`body_markdown`) are converted to HTML at build time via `parseMarkdown()` (`src/utils/markdown.ts`), which uses `marked` with a custom renderer piping code blocks through Prism for syntax highlighting.
- `fetchWithRetry` in `posts.ts` handles dev.to's rate limiting (429) with exponential backoff / `Retry-After` support — reuse it for any new dev.to calls rather than calling `fetch` directly.
- The `IArticle` type (`src/models/articles.ts`) mirrors the dev.to API article shape.
- `groupPostsByYear()` (`src/utils/posts.ts`) groups/sorts posts for the blog index timeline view.

**Page → Layout convention**: Every page wraps its content in `src/layouts/Layout.astro`, passing `title`, `description`, and `canonicalURL` props. `Layout.astro` owns the `<head>` (meta tags, OG/Twitter cards, favicons, Person + WebSite JSON-LD) and the page chrome (`<main class="max-w-[640px] ...">`). Pages additionally embed their own page-specific JSON-LD (`Blog`/`BlogPosting` schema) inline via `<script type="application/ld+json" set:html={...}>`.

**Analytics**: PostHog is loaded via `src/components/posthog.astro` (inlined snippet, project key hardcoded) in `Layout.astro`'s `<head>`. Event tracking is done ad hoc with inline `<script>` blocks per page/component that call `window.posthog.capture(...)` guarded by `typeof window !== 'undefined' && window.posthog`. Interactive elements that need click tracking (e.g. `CardProjects.astro`, `Header.astro` social links) use `data-*` attributes read by a companion `<script>` at the bottom of the same component rather than inline `onclick`. Follow this pattern for new trackable interactions. Global PostHog typings live in `src/types/posthog.d.ts`.

**Path alias**: `@/*` maps to `src/*` (configured in `tsconfig.json`). Use it instead of relative `../../` imports.

**Styling**: Tailwind CSS 4 via the Vite plugin (`@tailwindcss/vite`, configured in `astro.config.mjs`), imported once in `src/styles/global.css` with `@import "tailwindcss";`. That file also holds hand-written utility classes not expressible in Tailwind alone (`.link-hover` underline animation, `.post-item` hover, `.prose *` rules for rendered blog Markdown, Prism code-block theming). Colors are largely hardcoded hex/Tailwind-gray values chosen to pass WCAG AA — check `scripts/validate-contrast.js` before changing text/background color pairs, and add new combinations there if introducing new ones.

**Icons**: `astro-icon` with the `entypo-social` and `ph` Iconify sets (see `Header.astro` for usage via `<Icon name="entypo-social:linkedin" />`).

**SEO**: `@astrojs/sitemap` integration auto-generates `sitemap-index.xml`; `src/pages/robots.txt.ts` is an API route that emits `robots.txt` referencing it. `site` in `astro.config.mjs` is `https://danniel.dev` and is relied upon for canonical URLs and JSON-LD.

**i18n**: Uses Astro's built-in i18n routing (`i18n` block in `astro.config.mjs`): `es` is the `defaultLocale` and is served unprefixed at the root (preserves existing URLs/SEO); `en` is served under `/en/*` (`routing.prefixDefaultLocale: false`). Every Spanish page under `src/pages/` has a hand-written English mirror under `src/pages/en/` (`index.astro`, `blog.astro`, `blog/[slug].astro`, `404.astro`) — there's no automatic content translation, so when adding a new page, create both.
- Translation strings live in `src/i18n/ui.ts` (a flat `{ es: {...}, en: {...} }` dictionary) and are consumed via helpers in `src/i18n/utils.ts`: `useTranslations(lang)` returns a `t(key)` function, `useTranslatedPath(lang)` prefixes internal links for the current locale (`translatePath('/blog')` → `/blog` in `es`, `/en/blog` in `en`), and `getLocalizedPaths(pathname)` maps the current URL to its equivalent in each locale (used for `hreflang` alternates in `Layout.astro` and the language switcher in `Footer.astro`).
- Every component/page that needs the current locale computes it independently with `Astro.currentLocale ?? getLangFromUrl(Astro.url)` — there is no shared context/store, since `Astro.currentLocale` is derived per-request from the URL and is already available in any component.
- Blog content itself (post titles, bodies, descriptions) is **not translated** — it's fetched from dev.to in Spanish regardless of locale (per product decision, since there's no English content source there). Only the surrounding UI chrome is translated on `/en/blog*` routes; those pages also show a "Spanish only" notice (`blogHeader.spanishOnlyNotice`).
- When adding new user-facing copy, add both an `es` and `en` key to `ui.ts` rather than hardcoding strings in components.
