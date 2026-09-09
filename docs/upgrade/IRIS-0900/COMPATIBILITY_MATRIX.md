<!-- Generated with AI assistance (AIT-014) on 2026-09-09; reviewed by <handle>. -->
# IRIS-0900 compatibility matrix: Angular 14 -> 15

Repository: `northgate-iris-widget` (Angular Elements custom element `<northgate-iris-widget>`, no npm
package). Hop 14.3.0 -> 15.2.10, wave position: first application-tier repository of the estate 14 -> 15
wave, after Canopy 4.0.0 (CNPY-2140) and before retail-web (MOL-4471). Source for the framework ranges:
https://angular.dev/reference/versions (row "15.1.x || 15.2.x"). Everything else is taken from each
package's own `peerDependencies` / `engines` at the pinned version in `package-lock.json`
(`14-to-15/gates-15/npm-ls-depth0.log`). One column per hop; a hop only reads its own column and the one
to its left. The 15 -> 16 column is deliberately absent (one major at a time).

## Framework and toolchain

| item | 14 baseline | 15 target | official 15.1/15.2 range or peer at the pinned version | in range |
|---|---|---|---|---|
| `@angular/*` (animations, common, compiler, core, elements, forms, platform-browser, platform-browser-dynamic) | 14.3.0 | **15.2.10** | 15.x, all at one exact version (15.2.10 is the last 15.x runtime release); `@angular/elements@15.2.10` peer `@angular/core 15.2.10` | yes |
| `@angular/compiler-cli` | 14.3.0 | **15.2.10** | same as `@angular/core`; peer `typescript >=4.8.2 <5.0` | yes |
| `@angular/cli`, `@angular-devkit/build-angular` | 14.2.13 | **15.2.11** | 15.x (last 15.x CLI release); `build-angular` peer `@angular/compiler-cli ^15.0.0`, `typescript >=4.8.2 <5.0`, `karma ^6.3.0` | yes |
| `ngx-build-plus` (single bundle, ADR 0003) | 14.0.0 | **15.0.0** | peer `@angular-devkit/build-angular >=15.0.0`, `rxjs >= 6.0.0`. Still `singleBundle: true` + `outputHashing: bundles`; one `main.<hash>.js` produced | yes |
| `@angular/material`, `@angular/cdk` | 14.2.7 | **15.2.9** | peer `@angular/core ^15.0.0 \|\| ^16.0.0`, `@angular/cdk 15.2.9`; Material 15 = MDC components (Canopy 4 requires it). Iris imports `MatButtonModule` (MDC, not `legacy-button`) only | yes |
| `@northgate/canopy-ui` | 3.7.2 | **4.0.0** (exact) | peers `@angular/{animations,cdk,common,core,forms,material,material-moment-adapter,router} ^15.0.0`, `rxjs ^7.5.0`, `moment ^2.29.0`, `ngx-mask ^15.0.0`. Angular 15.2.10 is inside `^15.0.0`; Canopy is never newer than the Angular it is consumed with | yes |
| TypeScript | 4.7.4 | **4.9.5** | `>=4.8.2 <5.0` (last 4.9.x) | yes |
| RxJS | 7.5.7 | 7.5.7 (unchanged) | `^6.5.3 \|\| ^7.4.0` (`@angular/core`), `^7.5.0` (Canopy 4) | yes |
| zone.js (dependency; shipped only as `assets/vendor/zone.umd.min.js`, never in `iris.js`, ADR 0002) | 0.11.8 | **0.12.0** | `@angular/core@15.2.10` peer `~0.11.4 \|\| ~0.12.0 \|\| ~0.13.0`. The **host's** zone.js is what runs the widget in production: retail-web 0.11.8 is inside the range and HOST-VERIFIED (`14-to-15/CONSUMERS.md`) | yes |
| tslib | 2.4.1 | 2.4.1 (unchanged) | `^2.3.0` | yes |
| Node | 16.20.2 (`.nvmrc`, `engines` exact) | 16.20.2 (unchanged) | `^14.20.0 \|\| ^16.13.0 \|\| >=18.10.0` (`@angular/core`, `@angular/cli`, `build-angular` engines). Wave rule: Node stays 16 for the 14 -> 15 hop; one transitive dev package (`node-releases@2.0.54`, via browserslist) declares `node >=18` and warns `EBADENGINE`, no functional effect (`14-to-15/npm-install-after-core-update.log`) | yes |
| npm | 8.19.4 | 8.19.4 (unchanged; lockfile v2) | `@angular/cli@15` engines `^6.11.0 \|\| ^7.5.6 \|\| >=8.0.0` | yes |
| `@angular/flex-layout` | not used (Canopy 3 peer, never installed in Iris) | not used (Canopy 4 dropped the peer) | - | n/a |

## Widget output and host contract

| item | 14 baseline | 15 target |
|---|---|---|
| `tsconfig.json` target / `useDefineForClassFields` | es2020 / `false` | **ES2022** / `false` (unchanged) (CLI 15 migration `update-typescript-target`; Angular 15 emits ES2022, the flag keeps decorated field initialisation order) |
| Bundle (`dist/iris-widget/`) | 1 x `main.<hash>.js` 440,184 B + `iris.js` copy + `iris.manifest.json`, `assets/` | 1 x `main.<hash>.js` **480,207 B** (+40,023 B raw, gzip 125,093 -> 133,260 B) + `iris.js` + manifest; no extra chunk, no `polyfills.js`, no `Zone` definition inside the bundle |
| `angular.json` budgets (`initial`) | warn 900 kB / error 1400 kB; initial 429.87 kB | warn 900 kB / error 1400 kB (**unchanged**); initial 468.95 kB |
| `iris.manifest.json` | `element`, `file`, `stable`, `bytes`, `sha256`, `angular: 14.3.0`, `zoneJsCompatible` **absent** (postbuild read the wrong section) | `angular: 15.2.10`, **`zoneJsCompatible: "0.12.0"`** (postbuild fixed to read `dependencies`) |
| `src/polyfills.ts` (production) | `export {};` (empty, ADR 0002) | `export {};` (unchanged) |
| `src/main.ts` Zone guard | throws `[iris-widget] Zone.js is not present on the page...` when `Zone` is absent | unchanged |
| Test polyfills (`src/test-polyfills.ts`) | `zone.js`, `zone.js/testing` 0.11.8 | same imports, 0.12.0 |
| Dev shell / harness Zone (`assets/vendor/zone.umd.min.js`, an `angular.json` asset glob from `node_modules/zone.js/bundles/`, so it follows the pin; not part of the host contract) | 0.11.8 | 0.12.0 |
| Custom element API (`orchestrator-url`, `channel`, `bearer-token`, `sprite-url`, `open`; events) | as README | unchanged (`src/app/**` untouched) |
| Host Zone.js range verified | retail-web 0.11.8 (same version as the widget's own) | retail-web **0.11.8** (host page shape, HOST-VERIFIED) and 0.12.0 (harness). 0.13.x inside Angular's range, untested |
| Canopy usage | `CnToastModule`, `CnIconModule`, `CnButtonModule`, tokens (`@northgate/canopy-ui/tokens`) scoped under `.iris-root` | same modules; no Canopy typography mixin, no `.mat-*` override, no `cn-amount-slider` / `cn-filter-chips` (KAN-27/28), no `dense`/-2 density (KAN-34); Canopy 4 schematic found nothing to migrate |

## Third-party dev dependencies

| package | 14 baseline | 15 target | peer / compatibility note for 15 |
|---|---|---|---|
| `@angular-eslint/builder`, `eslint-plugin`, `eslint-plugin-template`, `schematics`, `template-parser` | 14.4.0 | **15.2.1** | angular-eslint 15.x line (last 15.x); `schematics` peer `@angular/cli >= 15.0.0 < 16.0.0`; plugins peer `eslint ^7.20.0 \|\| ^8.0.0`, `typescript *`. Updated in the same `ng update` as core/cli because 14.4.0's peer `@angular/cli < 15` blocked the first attempt (`14-to-15/ng-update-core-cli-attempt1-peer-conflict.log`) |
| `@typescript-eslint/eslint-plugin`, `parser` | 5.43.0 | 5.43.0 (unchanged; schematic wrote `^5.43.0`, re-pinned exact) | peer `eslint ^6.0.0 \|\| ^7.0.0 \|\| ^8.0.0`; supports TS 4.9 |
| `eslint` | 8.28.0 | 8.28.0 (unchanged; schematic wrote `^8.28.0`, re-pinned exact) | inside angular-eslint 15 peer |
| `@types/jasmine` | 4.0.3 | 4.0.3 | matches `jasmine-core` 4.3 |
| `@types/node` | 16.18.11 | 16.18.11 | fine on TS 4.9; matches Node 16 |
| `jasmine-core` | 4.3.0 | 4.3.0 | `karma-jasmine@5` peer |
| `karma` | 6.4.1 | 6.4.1 | `@angular-devkit/build-angular@15` peer `karma ^6.3.0` |
| `karma-chrome-launcher`, `karma-coverage`, `karma-jasmine`, `karma-jasmine-html-reporter`, `karma-junit-reporter` | 3.1.1, 2.2.0, 5.1.0, 2.0.0, 2.0.1 | unchanged | `karma-jasmine-html-reporter@2` peers `jasmine-core ^4.0.0`, `karma-jasmine ^5.0.0` |
| `@northgate/domain-fixtures` | 1.6.0 | 1.6.0 | test fixtures only; no Angular peer |
| `src/test.ts` | `require.context` discovery block + `declare const require` | discovery block removed by the CLI 15 migration (`update-karma-main-file`); builder discovers specs from `angular.json` `include` | `zone.js/testing` stays imported (IRIS-0812) |

## Canopy 4.0.0 peers Iris does not install

`@angular/router`, `@angular/material-moment-adapter`, `moment`, `ngx-mask` are declared by Canopy 4.0.0
(and were by 3.7.2) for entry points Iris does not import (date pickers, masked inputs, routed shell).
They were absent at the 14 baseline too; `npm ci` / `npm ls --depth=0` pass with npm 8's peer handling
(`14-to-15/gates-15/npm-ls-depth0.log`), the production build tree-shakes those entry points, and the
bundle contains none of them. Pre-existing, unchanged by this hop; recorded so the next hop does not
mistake it for a regression.
