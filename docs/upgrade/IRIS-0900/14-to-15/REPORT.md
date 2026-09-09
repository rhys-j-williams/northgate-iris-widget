<!-- Generated with AI assistance (AIT-014) on 2026-09-09; reviewed by <handle>. -->
# IRIS-0900 hop report: northgate-iris-widget Angular 14 -> 15, Canopy 4.0.0

| | |
|---|---|
| Repository | `rhys-j-williams/northgate-iris-widget` |
| Branch | `feature/IRIS-0900-angular-14-to-15` -> `develop` |
| Hop | Angular 14.3.0 -> **15.2.10** (CLI 14.2.13 -> 15.2.11), one major, no chaining to 16 |
| Library pin | `@northgate/canopy-ui` 3.7.2 -> **4.0.0** exact (Canopy 4 = Angular 15 / Material 15 MDC, CNPY-2140) |
| Artefact | `<northgate-iris-widget>` custom element bundle (no npm package, `published_package: n/a`); `iris.manifest.json` now `angular: 15.2.10`, `zoneJsCompatible: 0.12.0` |
| Wave position | Estate Angular 14 -> 15 wave (KAN-23), Stage 2, first consumer hop after Canopy 4 (Stage 1, canopy-ui PR #3, open). Apps (retail-web MOL-4471 and the rest) follow. Iris 15 -> 16 is **not** started here. |
| Jira | IRIS-0900; estate mirror epic KAN-23; Canopy decisions respected, not resolved: KAN-27, KAN-28, KAN-31, KAN-32, KAN-33, KAN-34; AI register AIT-014 |
| ADR | [`docs/adr/0004-angular-14-to-15-canopy-4.md`](../../../adr/0004-angular-14-to-15-canopy-4.md) |
| Matrix | [`docs/upgrade/IRIS-0900/COMPATIBILITY_MATRIX.md`](../COMPATIBILITY_MATRIX.md) |
| CAB | [`CAB_RECORD.md`](CAB_RECORD.md) (draft; train 2026.10.2) |
| Host verification | [`CONSUMERS.md`](CONSUMERS.md) (Iris has no npm consumers; the "consumer" is the retail-web host page) |
| Deprecations | [`deprecations.log`](deprecations.log) |

Every log cited below is in this directory unless prefixed with `00-baseline-14/` (the Angular 14.3.0
state of `origin/develop` at `d5735fa`'s parent) or `gates-15/` (the full gate run on the migrated tree).

## 1. Toolchain

| item | before (`00-baseline-14/`) | after (`gates-15/ng-version.log`, `npm-ls-depth0.log`) |
|---|---|---|
| `@angular/*` (animations, common, compiler, compiler-cli, core, elements, forms, platform-browser, platform-browser-dynamic) | 14.3.0 | **15.2.10** |
| `@angular/cli`, `@angular-devkit/build-angular` | 14.2.13 | **15.2.11** |
| `@angular/material`, `@angular/cdk` | 14.2.7 | **15.2.9** |
| `ngx-build-plus` (single bundle, ADR 0003) | 14.0.0 | **15.0.0** |
| `@northgate/canopy-ui` | 3.7.2 | **4.0.0** (peers `@angular/* ^15.0.0`; 15.2.10 is inside) |
| `@angular-eslint/*` | 14.4.0 | **15.2.1** |
| TypeScript | 4.7.4 | **4.9.5** (Angular 15 range `>=4.8.2 <5.0`) |
| `zone.js` (dependency; shipped as `assets/vendor/zone.umd.min.js` only, never bundled) | 0.11.8 | **0.12.0** |
| RxJS | 7.5.7 | 7.5.7 (unchanged) |
| `tslib` | 2.4.1 | 2.4.1 (unchanged) |
| `eslint`, `@typescript-eslint/*` | 8.28.0, 5.43.0 | 8.28.0, 5.43.0 (re-pinned exact after the angular-eslint schematic wrote `^`) |
| Node / npm (`.nvmrc`, `engines`, Jenkinsfile `nodeVersion`) | 16.20.2 / 8.19.4 | 16.20.2 / 8.19.4 (unchanged; Angular 15 range `^14.20.0 \|\| ^16.13.0 \|\| ^18.10.0`) |
| `@types/node` | 16.18.11 | 16.18.11 (unchanged, TOOL-1201 pin kept) |

No package at 16.x or later entered the lockfile (`gates-15/npm-ls-depth0.log`, `npm-ls-key.log`: every
`@angular/*` resolves to 15.2.10 / 15.2.9 / 15.2.11, one `typescript@4.9.5`, one `rxjs@7.5.7` at the top
level, one `zone.js@0.12.0`).

## 2. Commits (all `IRIS-0900 <summary>`, pushed after each milestone)

| commit | milestone |
|---|---|
| `d5735fa` Capture Angular 14 baseline before upgrade | `00-baseline-14/` gate run on the untouched tree; `.gitignore` gains `!docs/upgrade/**/*.log` so evidence logs can be committed (the repo ignored `*.log`) |
| `7664500` Commit baseline gate logs under docs/upgrade | the baseline `npm-ci` EINTEGRITY note (PLAT-2718: the local Verdaccio tarball of canopy-ui 3.7.2 did not match the committed lockfile integrity; lockfile entries regenerated before `npm ci`, see `00-baseline-14/npm-ci-eintegrity-plat-2718.log`) |
| `740aae8` Pin @northgate/canopy-ui 4.0.0 exact | library before consumer; tree does not build at this commit alone |
| `7dc950a` Update Angular core, CLI and angular-eslint to 15 | `ng update @angular/core@15 @angular/cli@15 @angular-eslint/schematics@15`; TS 4.9.5, zone.js 0.12.0, ngx-build-plus 15.0.0; exact pins restored. (The commit body says zone.js is a "dev dependency only": it is in `dependencies`, as on `develop`; the accurate statement is that it is never bundled, ADR 0002.) |
| `0b91eaa` Update Angular Material and CDK to 15.2.9, run Canopy 4 schematic | `ng update @angular/material@15`; `MatLegacyButtonModule` rewrite reverted to MDC `MatButtonModule` (unused by any template); Canopy `canopy-4-theme-mixin` schematic: nothing to do |
| `4942df4` Write zoneJsCompatible into the manifest and add retail-web host verification | `scripts/postbuild.js` read `devDependencies['zone.js']` and so had never written the documented `zoneJsCompatible` field (baseline manifest lacks it); reads `dependencies` now. `host-verification/` scripts and log |
| `1b311c7` Record Angular 15 gate logs | `gates-15/` |
| (this commit) | REPORT, CAB_RECORD, CONSUMERS, deprecations.log, matrix, ADR 0004, CHANGELOG, README |

Labelling: commits `d5735fa`..`4942df4` carry the `Co-Authored-By` trailer but **not** the
`AI-Assisted: AIT-014` / `AI-Assisted-Scope:` trailers required by `AI_ASSISTED_CODE_POLICY.md` s4.1;
`1b311c7` onwards do. History was not rewritten (no amend / force-push on a pushed branch). The PR
description carries the **AI-assisted content** section for the whole branch; whether the earlier commits
are reworded before merge or the squash-merge commit carries the trailer is for the reviewer (section 10).

## 3. Migrations applied

Full text in [`deprecations.log`](deprecations.log). Summary:

- `ng update @angular/core@15 @angular/cli@15` refused on the angular-eslint 14 peer
  (`ng-update-core-cli-attempt1-peer-conflict.log`); re-run with `@angular-eslint/schematics@15`
  (`ng-update-core-cli.log`). Files changed by migrations: `package.json`, `angular.json` (eslint schematic
  defaults), `src/test.ts` (Karma `require.context` block removed), `tsconfig.json` (`target: ES2022`,
  `useDefineForClassFields: false`). Router migrations: no matches (no router).
- `ng update @angular/material@15` (`ng-update-material.log`): rewrote the `MatButtonModule` import to the
  legacy module. Reverted to `@angular/material/button` (MDC) because no template uses `mat-button`; the
  only Material component Iris renders is `mat-icon` through `cn-icon`. No `@angular/material/legacy-*`
  import remains (`grep legacy src` -> 0).
- `npx ng update @northgate/canopy-ui --migrate-only --from=3.7.2 --to=4.0.0`
  (`ng-update-canopy-schematic.log`): "no Canopy typography overrides found, nothing to do". Iris has no
  theme include and no `mat.define-typography-config`; production `styles: []`; Canopy CSS variables are
  emitted into `.iris-root` by the widget component.
- `.mat-*` overrides in widget styles: `grep -rn '\.mat-' src --include=*.scss --include=*.html` -> 0.
  Nothing to replace with Canopy 4 tokens.
- `cn-amount-slider` / `cn-filter-chips` (interim, KAN-27 / KAN-28): 0 usages in `src/`. Iris uses
  `CnButtonModule`, `CnIconButtonModule`, `CnIconModule`, `CnToastModule` and the token mixins only.
- Canopy density: not used; no `dense` / `-2` (KAN-34).
- `@angular/flex-layout`: never a dependency of Iris; its removal from Canopy's peers changes nothing.

Hand fixes outside the schematics: exact re-pins (`eslint`, `@typescript-eslint/*`), the
`MatButtonModule` revert, and `scripts/postbuild.js` reading `dependencies['zone.js']`. No source under
`src/app/**` changed in this hop.

## 4. Gate results

| gate | baseline (`00-baseline-14/`) | after (`gates-15/`) | result |
|---|---|---|---|
| `npm ci` (Node 16.20.2, npm 8.19.4, local Verdaccio for `@northgate/*`) | exit 0 after lockfile regeneration (PLAT-2718) | exit 0, `npm-ci.log`; 5 EBADENGINE warnings (Node >= 18 wanted by transitive dev tooling), same count as baseline | PASS |
| lint (`ng lint`, no rules disabled, `.eslintrc.json` unchanged) | PASS | `lint.log`: "All files pass linting." | PASS |
| build dev (`ng build --configuration development` + postbuild) | PASS | `build-dev.log`, `iris.manifest.dev.json` | PASS |
| build prod (`npm run build:prod` = `ng build` + `scripts/postbuild.js`) | PASS, 0 warnings | `build-prod.log`: 0 warnings, one `main.a02a28579e486dca.js`, `[postbuild] ... -> iris.js, manifest written` | PASS |
| bundle budget (`angular.json` initial: warn 900 kB, error 1400 kB, unchanged) | 429.87 kB initial | **468.95 kB** initial (raw), 111.71 kB estimated transfer; no budget warning | PASS |
| single stable bundle (ADR 0003, postbuild) | 1 bundle, 440,184 B | 1 bundle, **480,207 B** (`bundle-sizes.log`), `iris.js` byte-identical copy, gzip 133,260 B (baseline 125,093 B) | PASS |
| tests + coverage (`npm test -- --watch=false`; Jenkinsfile: no minimum, IRIS-0490; Sonar reports it) | 14/14, 77.31% lines | `test.log`: **14/14 SUCCESS**; `coverage-summary.txt`: statements 77.73% (77.55), branches 69.07% (69.07), functions 81.96% (81.81), lines 77.31% (77.31) | PASS |
| check-mount harness (`npm run harness:check`, headless Chrome 137) | MOUNTED | `harness-check-mount.log`: MOUNTED, launcher + open panel rendered, "zone instances on page: 1" | PASS |
| host verification (retail-web page shape, host zone.js 0.11.8) | n/a | `host-verification/retail-web-host-check.log`: HOST-VERIFIED (section 8, `CONSUMERS.md`) | PASS |
| `ng version` | Angular 14.3.0 / CLI 14.2.13 | `ng-version.log`: Angular 15.2.10 / CLI 15.2.11 / TS 4.9.5 / rxjs 7.5.7 / Node 16.20.2 | PASS |
| `npm ls --depth=0` | clean | `npm-ls-depth0.log`: clean, no `ERR!`, no extraneous, no 16.x | PASS |
| `npm audit` (full tree) | exit 1, 40 vulns (4 low, 16 mod, 19 high, 1 crit), 61 finding ids | exit 1, **44 vulns (5 low, 16 mod, 22 high, 1 crit)**, 60 finding ids: 57 carried, 4 fixed, **3 NEW** (section 5) | **FAIL** (new dev-only ids) |
| `npm audit --production` | exit 1, 3 high, 17 ids | exit 1, 3 high, **17 ids, identical set**, 0 new | FAIL (carried, no new) |
| forbidden strings (GIS-1180, `check-forbidden-strings.sh`) | PASS | `forbidden-strings.log`: PASS working tree | PASS |
| Jenkins / Sonar coverage behaviour | `coverage/iris-widget/lcov.info`, no minimum | `lcov.info` produced at the same path; Jenkinsfile unchanged | PASS |

## 5. Audit findings (governance: no new id vs baseline)

`gates-15/audit-diff-vs-baseline.txt` diffs the advisory ids of `npm-audit.json` /
`npm-audit-production.json` against `00-baseline-14/`.

Production tree (`--production`, what could reach a customer): 17 ids before, 17 after, **same set**,
all on `@angular/common|compiler|core` (fixed versions are Angular >= 17/19, outside the one-major
rule). Carried; listed in `CAB_RECORD.md` s6.

Full tree: 4 ids fixed by the hop (`GHSA-23c5-xmqv-rm74`, `GHSA-3ppc-4f35-3m26`, `GHSA-7r86-cg39-jmmj`
minimatch; `GHSA-wr3j-pwj9-hqq6` webpack-dev-middleware). **3 new ids, all dev-only, all high**, none in
the shipped bundle:

| id | package | via | note |
|---|---|---|---|
| `GHSA-52v5-jr5w-gjxr` | sigstore | `@angular/cli@15.2.11` -> `pacote` | same id set Canopy reported on its own 15 hop (KAN-32) |
| `GHSA-73wf-gq98-2v4g` | browserslist | `@angular-devkit/build-angular@15.2.11` | same |
| `GHSA-c83g-rgw3-j3cx` | browserslist | `@angular-devkit/build-angular@15.2.11` | same |

The Canopy 4 decision on these dev-only ids (npm `overrides`, GIS risk acceptance, or wait for a CLI 15.2.x
that is not coming) is **KAN-32** and is open. This hop applies no `overrides` and does not claim the audit
gate; the branch is reported `PASS_WITH_BLOCKERS` on this gate until KAN-32 lands and the same treatment is
applied here.

## 6. Bundle and output delta

| | before | after | delta |
|---|---|---|---|
| `main.<hash>.js` = `iris.js` (raw) | 440,184 B | 480,207 B | +40,023 B (+9.1%) |
| gzip of `iris.js` | 125,093 B | 133,260 B | +8,167 B (+6.5%) |
| CLI "Initial Total" | 429.87 kB / 105.44 kB transfer | 468.95 kB / 111.71 kB transfer | +39.08 kB |
| budgets (`angular.json`) | 900 kB warn / 1400 kB error | unchanged | none needed |
| `iris.manifest.json` | `angular: 14.3.0`, **no** `zoneJsCompatible` (postbuild bug) | `angular: 15.2.10`, `zoneJsCompatible: 0.12.0` | field restored |
| `assets/vendor/zone.umd.min.js` (hosts without Zone; dev shell and harness only) | 0.11.8 | 0.12.0 | retail-web does not load it |
| `assets/canopy/canopy-sprite.svg` | Canopy 3.7.2 sprite | Canopy 4.0.0 sprite | same glob in `angular.json` |
| chunks | 1 | 1 | ADR 0003 holds |

The growth is Material 15 MDC (`cn-toast`, `cn-button`, `cn-icon-button` now compile the MDC
implementations in) plus Canopy 4's per-component token emission. It is inside the budget by a wide margin;
**no budget was raised**. Whether ~40 kB raw / ~8 kB gzip on the help page is acceptable is a retail-web call
(section 10).

## 7. Breaking changes and the host contract

- **Host contract (`README` "Zone", ADR 0002):** unchanged in shape. `src/polyfills.ts` is still `export {}`,
  `main.ts` still refuses to start without `window.Zone`, the bundle defines no `Zone`
  (`host-verification/retail-web-host-check.log`: "widget bundle defines Zone: false"). What moves is the
  Angular the widget runs on: 15.2.10, whose peer range is `zone.js ~0.11.4 || ~0.12.0 || ~0.13.0`.
  retail-web's 0.11.8 is inside that range and the host check passes against it; the manifest records
  `zoneJsCompatible: 0.12.0` (the version the widget's own tree pins and was unit/harness-tested with).
  The release runbook step 5 ("do not tag until retail-web have confirmed their Zone matches
  `zoneJsCompatible`") is therefore a **decision for release time**: accept 0.11.8 as verified-compatible
  (this evidence) or hold the tag until retail-web's own 14 -> 15 hop (MOL-4471) moves them to 0.12.x/0.13.x.
- **Version / semver:** `docs/runbooks/release.md` s2 says a change to the Angular/Zone pairing is a
  **major** for the widget. `package.json` `version` stays 1.9.4 on this branch; the bump (to 2.0.0 by that
  rule) is the release step and is recorded as a decision not made (section 10). CHANGELOG has an
  Unreleased entry.
- **Visuals:** `cn-toast`, `cn-button`, `cn-icon-button` render through Material 15 MDC inside Canopy 4.
  Canopy's own showcase acceptance is **KAN-31 (open)**. Iris has no visual regression suite; the
  harness proves mount and DOM, not pixels. Any MDC visual change in the toast or icon buttons inside the
  Iris panel is **not accepted here** and is raised for a human (section 10). KAN-33 (typography rename table)
  has no effect on Iris source, but if Canopy's default scale changes before Artifactory publish the rendered
  metrics inside the widget change with it; Iris must rebuild against the published 4.0.0.
- **a11y:** no change made or accepted. MDC changes focus-ring and touch-target behaviour of the buttons
  Canopy wraps; retail-web's a11y sign-off on the help page is theirs (section 10).
- **Public element API** (attributes `orchestrator-url`, `bearer-token`, `channel`, ...; events
  `irisOpen` / `irisClose`; `iris.manifest.json` fields; output paths): unchanged. `zoneJsCompatible` is now
  actually present, which the README already documented.
- **Node:** stays 16.20.2. Jenkinsfile (`northgate-pipeline@v3`, `nodeVersion: '16.20.2'`, agent
  `nodejs16-rhel8`) unchanged; no shared-library toolchain change was needed for CLI 15 (`npm ci`,
  `npm run lint`, `npm test -- --watch=false`, `npm run build:prod`, `npm run harness:check` are the same
  commands and all pass under Node 16.20.2).

## 8. Host verification (summary; detail in `CONSUMERS.md`)

Iris has no npm consumers. Its consumer is the host page.

| context | Angular / Zone on the page | result |
|---|---|---|
| check-mount harness (`scripts/harness`, `assets/vendor/zone.umd.min.js` 0.12.0 loaded first) | none / 0.12.0 | MOUNTED, 1 Zone instance |
| retail-web host page shape (scratch worktree of `northgate-retail-web` `develop` `8b456b7`: real CSP meta, `mat-typography` body, `src/zone-flags.ts` flags, the host's own `zone.js` 0.11.8 from its pin, then `iris.js` from `/assets/widgets/`) | 14.3.0 / 0.11.8 | HOST-VERIFIED: element defined, `.iris-root` + launcher + open panel rendered inside `#iris-root`, `window.Zone === hostZone`, no "Zone already loaded", 0 script errors, exactly one zone.js `<script>` (the host's), bundle defines no `Zone` |

retail-web's checked-out `develop` (`8b456b7`) contains **no Iris mount in source**: its
`docs/architecture.md` says the widget "loads from the CDN into a `<div id="iris-root">` in
`app.component.html`" (MOL-3410) and the estate overview describes a `scripts/vendor-iris.js` vendoring
step (MOL-4133), but neither `iris-root`, `northgate-iris-widget` nor a vendor script exists anywhere in
that checkout. The verification page therefore reproduces the host page (retail-web's `src/index.html`
CSP and body, its `zone-flags` and its pinned `zone.js` 0.11.8, loaded in the host's order) with the
documented `#iris-root` mount, rather than running retail-web's Angular app itself. This is the strongest
host check available from the repository as it stands; the gap between retail-web's documentation and its
source is reported to the coordinator (section 10). Nothing in the retail-web checkout was changed or
pushed (`git status` clean, recorded in `host-verification/retail-web-scratch-checkout.txt`).

## 9. Rollback

Revert the branch merge on `develop` (all changes are in this branch; no artefact is published until the
tag, `docs/runbooks/release.md`). If a 2.x artefact has been published to `cswt-generic/iris-widget/`,
retail-web's vendor script pins a version and simply stays on 1.9.4; nothing to unpublish. The local
Verdaccio copy of Canopy 4.0.0 is a build input only.

## 10. Decisions not made here (for KAN-23 / new Jira items)

1. **Audit, 3 new dev-only ids** (`GHSA-52v5-jr5w-gjxr`, `GHSA-73wf-gq98-2v4g`, `GHSA-c83g-rgw3-j3cx`): same
   ids as Canopy's KAN-32. Apply the KAN-32 outcome here; no `overrides` added.
2. **Host Zone acceptance at tag time:** retail-web 0.11.8 vs manifest `zoneJsCompatible` 0.12.0. Evidence
   says compatible (Angular peer range + host check); runbook step 5 wants retail-web's explicit confirmation.
3. **Widget version bump:** runbook says major (2.0.0) for an Angular/Zone pairing change; not bumped on this
   branch.
4. **Bundle growth** +40 kB raw / +8 kB gzip on the help page: inside budget, budget not raised; retail-web
   to accept.
5. **MDC visual change inside `cn-toast` / `cn-button` / `cn-icon-button`** in the Iris panel: depends on
   KAN-31; no Iris-side acceptance, no screenshot baseline exists in this repo.
6. **a11y** re-check of the widget's buttons and toast under MDC: retail-web help page sign-off.
7. **AI-Assisted trailer** missing on the first six commits (section 2): reword before merge or rely on
   the squash-merge commit / PR section.
8. KAN-33: if the Canopy typography table changes, rebuild Iris against the published 4.0.0 and re-run
   `gates-15` + host verification before tagging.
9. **retail-web has no Iris mount in source** (section 8): the host check ran against the documented host
   page shape, not retail-web's running Angular app. A verification inside the real app (and the missing
   `#iris-root` / vendor step) belongs to retail-web's MOL-4471 hop.

## 11. Next

Not on this branch: Iris 15 -> 16 (after Canopy 5), retail-web MOL-4471 (their pin bump to Canopy 4 and
Angular 15, and their Zone bump), IRIS-0790 (build-time Zone check in the vendor script; the manifest field
it needs now exists).
