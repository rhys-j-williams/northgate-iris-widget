<!-- Generated with AI assistance (AIT-014) on 2026-09-09; reviewed by <handle>. -->

# IRIS-0900 Angular 14 -> 15: host verification for the `<northgate-iris-widget>` bundle

Iris publishes no npm package (`published_package: n/a`). Its "consumer" is the host page that loads
`iris.js` from a script tag and puts `<northgate-iris-widget>` on the page, relying on the host's own
Zone.js (ADR 0002). The verification therefore answers three questions for the Angular 15.2.10 bundle:

1. does the custom element still register (`customElements.define('northgate-iris-widget')`);
2. does it render with the Zone.js the **host** provides, not one of its own;
3. does the page end up with exactly one Zone (no `Zone already loaded`, no second Zone definition).

Candidate: `dist/iris-widget/main.a02a28579e486dca.js` = `iris.js`, 480,207 B, sha256
`95b5e8de...d54708`, `iris.manifest.json` `angular: 15.2.10`, `zoneJsCompatible: 0.12.0`
(`gates-15/iris.manifest.json`). `@angular/core@15.2.10` peer: `zone.js ~0.11.4 || ~0.12.0 || ~0.13.0`.

## Result table

| Host context | Angular on page | Zone.js on page (provider) | Result | Evidence |
|---|---|---|---|---|
| check-mount harness (`npm run harness:check`; `scripts/harness/serve.js` + `check-mount.js`, headless Chrome 137) | none | 0.12.0 (`assets/vendor/zone.umd.min.js`, shipped for hosts without Zone) | **PASS** MOUNTED; launcher and open panel rendered; "zone instances on page: 1" | [`gates-15/harness-check-mount.log`](gates-15/harness-check-mount.log) |
| `northgate-retail-web` host page shape, scratch worktree of `origin/develop` `8b456b7` (Angular 14.3.0, Node 16.20.2) | 14.3.0 (host contract; the host's app bundle is not executed, see method) | **0.11.8** (host's pin: `package.json` / `package-lock.json`; `src/polyfills.ts` imports `zone.js/dist/zone` after `src/zone-flags.ts`) | **PASS** HOST-VERIFIED | [`host-verification/retail-web-host-check.log`](host-verification/retail-web-host-check.log) |
| `northgate-business-web`, `keystone-web`, `ledgerline-web` | - | - | NOT_APPLICABLE | do not host Iris (estate overview: retail-web is the only host) |

No FAIL. No other repository was modified or pushed: the retail-web worktree is read-only input and its
`git status` is clean ([`host-verification/retail-web-scratch-checkout.txt`](host-verification/retail-web-scratch-checkout.txt)).
No retail-web PR was opened.

## retail-web: what the host provides today

From the scratch checkout (`retail-web-scratch-checkout.txt`, `retail-web-host-check.log` header):

| item | value |
|---|---|
| `@angular/core` | 14.3.0 |
| `zone.js` | **0.11.8**, loaded by `src/polyfills.ts` as `import 'zone.js/dist/zone'` (MOL-1870 note: the `dist/` path is deliberate) after `import './zone-flags'` |
| `src/zone-flags.ts` | `__zone_symbol__UNPATCHED_EVENTS = ['scroll', 'mousemove']`, `__Zone_disable_requestAnimationFrame = true` |
| `@northgate/canopy-ui` | 3.7.2 (irrelevant to the widget: Canopy is compiled into `iris.js` and its tokens are scoped to `.iris-root`) |
| CSP (`src/index.html`) | `script-src 'self' http://localhost:4607` (no inline script, no eval), `connect-src` allow-list without the orchestrator |
| Iris mount in source | **none.** `docs/architecture.md` documents "loads from the CDN into `<div id="iris-root">` in `app.component.html`" (MOL-3410); neither `iris-root` nor `northgate-iris-widget` nor a vendor script (`scripts/vendor-iris.js`, MOL-4133 per the estate overview) exists on `develop` `8b456b7`. |

Host Zone.js range the widget is verified against: **0.11.8** (retail-web today, proven by this check)
and **0.12.0** (widget's own pin, unit tests, dev shell and harness). Both are inside Angular 15.2.10's
declared peer range; 0.13.x is inside the range but untested. `zoneJsCompatible` in the manifest is
0.12.0. The release runbook (s5) asks retail-web to confirm their Zone against that field before the
tag; with 0.11.8 on the host that confirmation is a decision, not a match (REPORT.md s10.2).

## retail-web: method

`host-verification/retail-web-host-check.js` (Node, no dependencies beyond the repo's Chrome):

1. Reads the host checkout (`--host-repo`) **read-only**: `package.json` `zone.js` pin, presence of
   `src/zone-flags.ts`, `src/polyfills.ts` import path. Fails if the unpacked host `zone.js` package
   (`--host-zone`, `npm pack zone.js@0.11.8` extracted) does not equal the host pin.
2. Serves on `127.0.0.1:4206`:
   - `/` -> `retail-web-host.html`: retail-web's `index.html` CSP meta and `<body class="mat-typography">`,
     then in the host's order `/host/zone-flags.js` (the two flags from `src/zone-flags.ts`), `/host/zone.js`
     (`zone.js/dist/zone.js` **0.11.8** from the host package), `/host/probe.js`, then `<div id="iris-root">`
     containing `<northgate-iris-widget orchestrator-url="http://localhost:4517" channel="retail-web" ... open>` and
     finally `<script src="/assets/widgets/iris.js">` (the mount contract path).
   - `/assets/widgets/*` -> `dist/iris-widget/*` (the production build under test).
3. Drives headless Chrome (`CHROME_BIN`, `--headless=new`, throwaway profile) at the page, reads the
   probe's output from `document.body` data attributes and the DOM.
4. `probe.js` (external file, so it runs under the host CSP) records: Zone present before the bundle,
   flag values, `customElements.whenDefined('northgate-iris-widget')`, `.iris-root` / launcher / open
   panel rendered inside `#iris-root`, `window.Zone === <the host's Zone object>`, any `Zone already
   loaded` error, `window.onerror` count, CSP violations.
5. The driver then counts `<script src="/host/zone.js">` tags (must be 1) and scans `iris.js` for a
   `function Zone(` definition (must be absent).

The host's Angular application bundle is **not** executed (there is no Iris mount in it to exercise);
what is reproduced is everything on the host page that the widget's boot depends on: the Zone instance
and its flags, load order, CSP, body typography class.

## retail-web: results (Angular 15.2.10 bundle, host zone.js 0.11.8)

From [`host-verification/retail-web-host-check.log`](host-verification/retail-web-host-check.log):

```
host zone present before bundle: true
host zone flags: UNPATCHED_EVENTS=["scroll","mousemove"] disable_requestAnimationFrame=true
customElements.define fired for northgate-iris-widget
csp violation: connect-src blocked http://localhost:4517/iris/v1/sessions
rendered .iris-root inside #iris-root: true
rendered launcher: true
rendered open panel: true
window.Zone is still the host Zone object after bundle: true
"Zone already loaded" error seen: false
script errors: 0
HOST-VERIFIED
[host-check] zone.js <script> tags on page: 1 (the host's); widget bundle defines Zone: false
```

The one CSP violation is the widget's first orchestrator call (`POST /iris/v1/sessions` to 4517) being
blocked by retail-web's `connect-src`, which does not list the orchestrator and no orchestrator was
running. That is the host's policy, not a widget error: the widget handles it as "Iris isn't available
right now" (README "Build and run"), and the panel still rendered. On the real help page the orchestrator
is reached through the host's BFF allow-list.

## What this does and does not prove

- Proves: Angular 15.2.10 + Canopy 4.0.0 in the bundle boot on a page whose only Zone is the host's
  0.11.8 with retail-web's patch flags; the element registers; the panel renders; there is one Zone.
- Does not prove: pixel-level appearance of `cn-toast` / `cn-button` / `cn-icon-button` under MDC
  (KAN-31 pending in Canopy; no screenshot baseline in Iris), a11y of the MDC buttons, or behaviour
  inside retail-web's running NgRx app (no Iris mount exists in its source to run). Those belong to
  retail-web's own hop (MOL-4471) and are listed in `REPORT.md` s10.

## What the retail-web side must do (MOL-4471 / their ticket, not this PR)

- Vendor the tagged Iris artefact from `cswt-generic/iris-widget/<version>/` (bundle **and** `assets/`,
  ADR 0003) and confirm their Zone against `iris.manifest.json` `zoneJsCompatible` (runbook s5; IRIS-0790
  would automate it and the field now exists).
- When retail-web moves to Angular 15, their `zone.js` moves to 0.12.x/0.13.x; both are inside the widget's
  Angular 15.2.10 range, so no Iris rebuild is required for that, but re-run this check with their new pin.
