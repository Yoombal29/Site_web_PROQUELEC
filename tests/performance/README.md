# 🚀 Performance Tests — PROQUELEC

## Lighthouse CI

Lighthouse CI is configured via `.lighthouserc.json` and runs weekly (Mondays at 6:00 UTC)
or manually via GitHub Actions.

### Running Locally

```bash
# Install Lighthouse CI globally
npm install -g @lhci/cli

# Build and run audit
npm run build
lhci autorun --config=.lighthouserc.json

# Or audit a specific URL
lighthouse http://localhost:4173/ --view
```

### Tested Pages

- `/` — Homepage
- `/contact` — Contact page
- `/services` — Services page

### Thresholds

| Category | Minimum Score |
|----------|--------------|
| Performance | 0.70 |
| Accessibility | 0.85 |
| Best Practices | 0.85 |
| SEO | 0.90 |

## Manual Performance Checks

### Bundle Size
```bash
npx vite build --report
```

### Slow Routes
Check server logs for requests > 1000ms:
```bash
grep "responseTime" server.log | awk -F'"' '{print $2}' | sort -n | tail -10
```

## Accessibility Audit Tests

Automated accessibility pattern checks are defined in `tests/performance/accessibility.test.ts`.

### Running

```bash
npx vitest run tests/performance/accessibility.test.ts
```

### What Is Checked

| Test | Purpose |
|------|---------|
| `button elements` | Counts buttons; flags those without `aria-label` or visible text |
| `images alt` | Ensures all `<img>` elements have an `alt` attribute |
| `semantic HTML` | Verifies `<main>`, `<nav>`, `<header>`, `<footer>` are used |
| `label-input associations` | Checks `<input>` elements have `aria-label` or associated `<label>` |
| `heading hierarchy` | Confirms `<h1>`, `<h2>`, `<h3>` are present for proper document outline |

> ⚠️ These are **static code-pattern checks**. They do **not** replace a full browser-based
> accessibility audit (e.g. axe-core, Lighthouse Accessibility audits, or manual keyboard testing).
