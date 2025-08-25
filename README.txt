# cTrader Mobile WebView Plugin — Final Files

This folder contains two working approaches:

1) **Single-file (CDN ESM)** — `index.html`
   - Easiest to host. Imports SDK from `esm.sh` dynamically and shows clear boot errors in the UI.
   - Works if the mobile WebView allows external ESM.
   - Open: `index.html?theme=dark&lang=en&platform=ios&placement=wl_bs`

2) **Bundle build (no external ESM)** — `index.bundle.html` + `src/app.mjs` + `package.json`
   - Preferred for cTrader *Mobile* if ESM from external domains is blocked.
   - Build once, host `app.bundle.js` next to `index.bundle.html`.

## Build (bundle approach)

```bash
npm i
npm run build
# Produces app.bundle.js in this folder
```

Upload `index.bundle.html` and `app.bundle.js` to your host. Use the same URL parameters as above (theme/lang/platform/placement/symbol).

## Notes

- The plugin uses the official WV SDK: handshake via `registerEvent` + `handleConfirmEvent`, then example calls to `getAccountInformation`, `getLightSymbolList`, and quote subscribe/unsubscribe.
- No `window.parent.postMessage` is used (mobile WebView is top-level, not in an iframe).
- If `index.html` shows “SDK import failed”, your WebView blocks external modules — use the bundle build.
