<!-- Generated with AI assistance (AIT-014) on 2026-09-09; reviewed by <handle>. -->
<!-- Draft from northgate-platform-tooling/governance/CAB_TEMPLATE.md (template 4.2, RM-STD-003). Not yet submitted. -->
# Change Advisory Board submission — CSWT

## 1. Record

| field | value |
|---|---|
| CHG number | CHG_______ (assigned by ITSM on save; not an emergency change) |
| Change type | Normal |
| Release train | 2026.10.2 (code freeze Fri 2026-10-02, CAB Tue 2026-10-06, deploy Thu 2026-10-08). 2026.09.2 froze on 2026-09-04 and cannot take this change; 2026.09.4 is skipped for the Q3 quarter-end freeze. Iris publishes an artefact, it does not deploy: retail-web vendors the artefact on its own train (MOL-4471), and the quarter-end freeze applies to them, not to the publish. |
| Requested implementation window | Thu 2026-10-08 20:00 to 23:00 ET (publish + tag only) |
| Requesting team | retail-digital (CODEOWNERS); Iris maintainers m.calderon, b.arceneaux (README) |
| Change owner (accountable) | TBC (retail-digital, M2 or above) |
| Implementer | TBC (retail-digital release engineer running the Jenkins tag pipeline) |
| Business sponsor | TBC (Northgate Online product owner, help-page chat) |
| Application(s) and CMDB app-id(s) | `iris-widget` (Iris virtual assistant custom element; CMDB app-id TBC from the retail-digital service record). No host application changes in this CHG. |
| Environment(s) | Artifactory `cswt-generic/iris-widget/<version>/` (artefact publish only; no prod-east / prod-west deployment). Depends on `@northgate/canopy-ui@4.0.0` being on Artifactory `npm-northgate` first (Canopy CHG from CNPY-2140, canopy-ui PR #3). |
| Jira release version | IRIS-0900 (demo mirror: KAN-23 epic; Canopy decisions KAN-27/28/31/32/33/34 respected) |
| Evidence bundle | `docs/upgrade/IRIS-0900/14-to-15/` on branch `feature/IRIS-0900-angular-14-to-15` (Artifactory `generic-cswt-release-evidence` URL to be added by `Jenkinsfile.release`) |

## 2. Summary of change

Framework (Angular major) upgrade of the Iris virtual assistant widget, an Angular Elements custom element
loaded by retail-web's help page from a single script tag. Angular 14.3.0 -> 15.2.10, Angular Material /
CDK 14.2.7 -> 15.2.9 (Material MDC), TypeScript 4.7.4 -> 4.9.5, and the design-system pin
`@northgate/canopy-ui` 3.7.2 -> 4.0.0 exact (Canopy 4 is the Angular 15 / MDC release, CNPY-2140). This is
the first application-tier hop of the estate's Angular 14 -> 15 wave (KAN-23), taken before retail-web
because the widget must be rebuilt on an Angular compatible with the host's Zone.js before the host moves
(README "Zone", ADR 0002). The host contract is unchanged: the widget still bundles no Zone.js, still
refuses to boot without the host's Zone, still emits one content-hashed bundle plus `iris.js` and
`iris.manifest.json` (ADR 0003). Verified mounting on a retail-web host page shape with retail-web's
current zone.js 0.11.8 (`CONSUMERS.md`). Node stays 16.20.2; RxJS stays 7.5.7; no widget source under
`src/app/**` changed. The element's attributes, events, output paths and budgets do not change; the
`zoneJsCompatible` manifest field, documented since 1.9.2 but never written because of a `postbuild.js`
bug, is now emitted (`0.12.0`).

## 3. Scope

### In scope

| component | from | to | change |
|---|---|---|---|
| `northgate-iris-widget` bundle (`iris.js`, `iris.manifest.json`, `assets/`) | 1.9.4 (Angular 14.3.0, Canopy 3.7.2, 440,184 B) | next tag (Angular 15.2.10, Canopy 4.0.0, 480,207 B; version bump per runbook s2 at release, see s6 decisions) | framework hop 14 -> 15, Material MDC via Canopy 4, CLI 15.2.11, TS 4.9.5, zone.js pin 0.12.0 (vendor asset only), angular-eslint 15.2.1, `tsconfig` target ES2022, `postbuild.js` manifest fix, evidence under `docs/upgrade/IRIS-0900/`, ADR 0004, CHANGELOG, README |

### Out of scope / explicitly not changing

- retail-web: its Iris vendoring, its Zone.js (0.11.8), its Angular (14.3.0), its Canopy pin (3.7.2). retail-web's own Angular 15 hop and Canopy 4 pin are MOL-4471. No retail-web PR opened; scratch checkout read-only.
- canopy-ui: not modified. Iris consumes the 4.0.0 package built from `feature/CNPY-2140-angular-14-to-15` (PR #3, not merged; KAN-23 gate waiver) via a local Verdaccio. Before this CHG can publish, 4.0.0 must be on Artifactory and Iris re-verified against that exact tarball (lockfile integrity).
- Angular 16+, Material 16+, TypeScript 5, Node 18, RxJS 7.8: not in this change (one major at a time).
- Bundle budgets (`angular.json` 900 kB / 1400 kB), coverage threshold (none, IRIS-0490), lint rules, `.npmrc`, CSP, CODEOWNERS: unchanged.
- Widget behaviour, element API, orchestrator contract (`/iris/v1`), Keystone token handling: unchanged.
- `iris-orchestrator`, `bff-retail`, Jenkins shared library (`northgate-pipeline@v3` already supports CLI 15 on Node 16.20.2): unchanged.

## 4. Risk assessment

| | |
|---|---|
| Risk rating | Medium (RM-STD-003 appendix A). No deployment in this CHG, but the artefact runs inside the Tier 1 retail-web help page once vendored, and the Angular/Zone pairing changes, which is the failure mode of IRIS-0402 / MOL-3811. |
| Customer impact during implementation | None. Publishing to `cswt-generic` has no runtime effect until retail-web vendors the version. |
| Customer impact if it goes wrong | On the host page, a Zone incompatibility fails at boot in the customer's browser (README "Zone"): the help page falls back to the "chat unavailable" tile and phone number (best-effort service, no paging). Mitigated by the host verification against the host's exact zone.js 0.11.8 (`CONSUMERS.md`, HOST-VERIFIED), by Angular 15.2.10's declared peer range including 0.11.8, and by the vendor step being retail-web's own gated change. |
| Regulatory or data classification considerations | `DATA_CLASSIFICATION.md`: Synthetic, Non Restricted. No data flow change; forbidden-strings check PASS (`gates-15/forbidden-strings.log`). |
| Dependencies on other changes | Canopy 4.0.0 on Artifactory (CNPY-2140 CHG) **hard**; KAN-32 decision on dev-only audit ids **before the audit gate can be called green**; KAN-31 showcase visual acceptance (MDC) advisable before retail-web vendors. |
| Blast radius | retail-web help page (only host). Dev shell and harness (`assets/vendor/zone.umd.min.js` 0.12.0). |

## 5. Dependency and platform changes

| dependency | from | to | reason | DEPENDENCY_POLICY.md exception ref (if any) |
|---|---|---|---|---|
| `@angular/*` (9 packages incl. `elements`) | 14.3.0 | 15.2.10 | framework hop N -> N+1 | none |
| `@angular/cli`, `@angular-devkit/build-angular` | 14.2.13 | 15.2.11 | CLI for Angular 15 | none |
| `@angular/material`, `@angular/cdk` | 14.2.7 | 15.2.9 | Material 15 / MDC, required by Canopy 4 | none |
| `@northgate/canopy-ui` | 3.7.2 | **4.0.0** (exact) | library before consumer; peers `@angular/* ^15.0.0` | none (internal registry) |
| `ngx-build-plus` | 14.0.0 | 15.0.0 | single-bundle builder for CLI 15 (ADR 0003) | none |
| `typescript` | 4.7.4 | 4.9.5 | Angular 15 range `>=4.8.2 <5.0` | none |
| `zone.js` | 0.11.8 | 0.12.0 | Angular 15 line; **shipped only as `assets/vendor/zone.umd.min.js`**, never in `iris.js` (ADR 0002) | none |
| `@angular-eslint/*` (5 packages) | 14.4.0 | 15.2.1 | lint builder for CLI 15 | none |
| `eslint`, `@typescript-eslint/*` | 8.28.0, 5.43.0 | no change (schematic wrote `^`, re-pinned exact) | inside angular-eslint 15 peers (`eslint ^7.20.0 \|\| ^8.0.0`) | none |
| Node / npm | 16.20.2 / 8.19.4 | no change | inside Angular 15 range `^14.20.0 \|\| ^16.13.0 \|\| ^18.10.0`; wave rule | Node 16 EOL 2023-09-11 is covered by the Iris acceptance TR-1203 (FRAMEWORK_SUPPORT_STANDARD s6, expires 2026-11-18 ceiling); estate-wide, not this CHG |
| RxJS, `tslib`, `@types/node` | 7.5.7, 2.4.1, 16.18.11 | no change | inside matrix | none |

- Lifecycle status of the "to" column: Angular 15.2.10 end of life (vendor LTS ended 2024-05-18; intermediate wave position, 15 -> 16 follows after Canopy 5); TypeScript 4.9 unsupported (bounded by the Angular 15 range); Node 16.20.2 end of life (estate-wide; wave plan); eslint 8.28.0 end of life (unchanged in this hop); angular-eslint 15.2.1 unsupported (tied to Angular 15); Canopy 4.0.0 current.
- No version moves outside the estate version map without an ADR: ADR 0004 (`docs/adr/0004-angular-14-to-15-canopy-4.md`) records the hop; `docs/upgrade/IRIS-0900/COMPATIBILITY_MATRIX.md` has the 15 column.

## 6. Testing and evidence

| evidence | location | result |
|---|---|---|
| Unit tests and coverage (no minimum, IRIS-0490; Sonar reports) | `gates-15/test.log`, `gates-15/coverage-summary.txt`, `gates-15/lcov.info` | 14/14 specs pass; 77.31% lines (baseline 77.31%), 77.73% statements (77.55), 69.07% branches (69.07), 81.96% functions (81.81) |
| Lint (no rules disabled) | `gates-15/lint.log` | "All files pass linting." |
| Production build, zero warnings, single bundle, postbuild | `gates-15/build-prod.log`, `gates-15/bundle-sizes.log`, `gates-15/iris.manifest.json` | exit 0, 0 warnings, 1 bundle 480,207 B (baseline 440,184 B), initial 468.95 kB vs budget warn 900 kB, `iris.js` + manifest written |
| Development build | `gates-15/build-dev.log`, `gates-15/iris.manifest.dev.json` | exit 0 |
| Check-mount harness (the release gate, README "Tests") | `gates-15/harness-check-mount.log` | MOUNTED, 1 Zone instance |
| Host verification (retail-web page shape, host zone.js 0.11.8) | `CONSUMERS.md`, `host-verification/retail-web-host-check.log` | HOST-VERIFIED: element registered, panel rendered, `window.Zone` is the host's, no double Zone, 0 script errors |
| `ng version`, `npm ls --depth=0`, `npm ci` | `gates-15/ng-version.log`, `gates-15/npm-ls-depth0.log`, `gates-15/npm-ls-key.log`, `gates-15/npm-ci.log` | Angular 15.2.10 / CLI 15.2.11 / TS 4.9.5 / Node 16.20.2; tree clean, no 16.x package |
| npm audit (full tree) | `gates-15/npm-audit.log`, `gates-15/npm-audit.json`, `gates-15/audit-diff-vs-baseline.txt` | **FAIL**: 44 vulns (baseline 40); ids 60 vs 61: 57 carried, 4 fixed, **3 new dev-only high** (table below) |
| npm audit `--production` | `gates-15/npm-audit-production.log`, `gates-15/npm-audit-production.json` | FAIL (carried): 3 high, 17 ids, identical set to baseline, 0 new |
| Forbidden strings (GIS-1180) | `gates-15/forbidden-strings.log` | PASS |
| Sonar quality gate, Checkmarx, Xray | pipeline on the PR branch | to be attached by Jenkins; no scanner ran locally |
| Baseline (Angular 14.3.0, same gates) | `00-baseline-14/` | recorded before any change |
| uat regression suite | not applicable | artefact publish; retail-web's vendor change carries UAT |
| Manual UAT sign off | **required at vendor time (retail-web)**: visual check of `cn-toast` / `cn-button` / `cn-icon-button` under Material MDC inside the Iris panel; no screenshot baseline exists in this repo; Canopy showcase acceptance KAN-31 pending | not done here |
| Performance test | not applicable | +40 kB raw / +8 kB gzip on the help page; inside budget; retail-web to accept |
| Accessibility check | **not done here**; MDC changes focus ring / touch target of Canopy buttons; retail-web help page a11y sign-off | open |
| Security review | not applicable | GIS-STD-014/021/030 material unchanged; no `.npmrc`, CSP or `SECURITY.md` change |

Open findings carried into the artefact, with the GIS risk acceptance reference for each:

| finding id | severity | GIS acceptance | expiry |
|---|---|---|---|
| npm audit production tree: 17 ids on `@angular/common` (`GHSA-39pv-4j6c-2g6v`, `GHSA-48r7-hpm6-gfxm`, `GHSA-58c5-g7wp-6w37`, `GHSA-jhpw-976m-542j`, `GHSA-p3vc-36g9-x9gr`, `GHSA-q6f4-qqrg-jv6x`), `@angular/compiler` (`GHSA-58w9-8g37-x9v5`, `GHSA-f3m7-gqxr-g87x`, `GHSA-jj27-h5hq-8x99`, `GHSA-jrmj-c5cx-3cw6`, `GHSA-v4hv-rgfq-gp49`), `@angular/core` (`GHSA-692r-grfm-v8x7`, `GHSA-f3m7-gqxr-g87x`, `GHSA-jj27-h5hq-8x99`, `GHSA-jrmj-c5cx-3cw6`, `GHSA-prjf-86w9-mfqv`, `GHSA-rgjc-h3x7-9mwg`) | High / Moderate | identical set to the 14.3.0 baseline; fixes are Angular >= 17/19; covered by the Iris acceptance TR-1203 (FRAMEWORK_SUPPORT_STANDARD s6: Angular 14.3 EOL 2023-11-18, expires **2026-11-18 ceiling**; this hop moves the line to Angular 15.2, EOL 2024-05-18, acceptance to be re-issued by GIS) | 2026-11-18 (TR-1203) / on the next hop |
| npm audit dev tree, **new**: `GHSA-52v5-jr5w-gjxr` (`sigstore` via `@angular/cli@15.2.11` -> `pacote`) | High (npm) | **KAN-32, option not selected** (npm `overrides` under a DEPENDENCY_POLICY exception, or GIS exception until 15 -> 16). Same id Canopy 4 carries. Not in the shipped bundle. | TBC by KAN-32 |
| npm audit dev tree, **new**: `GHSA-73wf-gq98-2v4g`, `GHSA-c83g-rgw3-j3cx` (`browserslist` via `@angular-devkit/build-angular@15.2.11`) | High (npm) | **KAN-32, option not selected**. Same ids Canopy 4 carries. Not in the shipped bundle. | TBC by KAN-32 |
| npm audit dev tree carried (57 ids: tar, webpack-dev-server, postcss, image-size, serialize-javascript, qs, tmp, uuid, ajv, esbuild, piscina, pacote, @babel/*, webpack) | Critical 1 (tar), High, Moderate, Low | carried from baseline, same ids; none in the shipped bundle (`iris.js` depends only on Angular, Material, CDK, Canopy, rxjs, tslib) | estate-wide, per DEPENDENCY_POLICY exceptions |

Fixed by the hop (no longer present): `GHSA-23c5-xmqv-rm74`, `GHSA-3ppc-4f35-3m26`, `GHSA-7r86-cg39-jmmj`
(`minimatch`), `GHSA-wr3j-pwj9-hqq6` (`webpack-dev-middleware`).

Decisions the CAB / owners must take that this record does not (REPORT.md s10): KAN-32 treatment of the 3 new
dev ids; acceptance of host zone.js 0.11.8 vs manifest `zoneJsCompatible` 0.12.0 at tag time (runbook s5);
widget version bump (runbook s2: major -> 2.0.0); bundle growth acceptance; MDC visual acceptance (KAN-31);
a11y re-check; `AI-Assisted` trailer on the first six commits.

## 7. Implementation plan

1. Prerequisite: Canopy CHG publishes `@northgate/canopy-ui@4.0.0` to Artifactory `npm-northgate`. Iris re-runs `npm ci` against Artifactory (lockfile integrity of the 4.0.0 tarball will differ from the Verdaccio stand-in; regenerate the lockfile entry in a follow-up commit if so, as was needed at baseline, PLAT-2718) and re-runs `gates-15` + host verification. 30 min.
2. retail-digital: merge PR `feature/IRIS-0900-angular-14-to-15` -> `develop` after two approvals (one retail-digital, `@northgate/cswt-architecture` for `docs/adr/`, `@northgate/gis-appsec` for section 6). 5 min.
3. Release manager: `develop` -> `release/2026.10` at code freeze 2026-10-02 17:00 ET.
4. Bump `version` in `package.json` (runbook s2 decision) and CHANGELOG date; tag `iris-widget/v<version>` on `develop` **only after retail-web confirms their Zone** against `zoneJsCompatible` (runbook s5). Jenkins (`northgateNodePipeline`, `nodejs16-rhel8`, Node 16.20.2): `npm ci`, `npm run lint`, `npm test -- --watch=false`, `npm run build:prod`, `npm run harness:check`, publish `dist/iris-widget/` to `cswt-generic/iris-widget/<version>/`, post manifest to `#retail-digital`. 15 min.
5. No application deployment. retail-digital tells the retail-web release manager; retail-web vendors on their own train under MOL-4471 with their own CHG.

Estimated duration: 1 hour including the re-verification in step 1. Bridge: not required. Communications: `#retail-digital` release note.

## 8. Rollback plan

| | |
|---|---|
| Rollback trigger | `harness:check` fails in the tag pipeline; retail-web's vendor build or their host verification fails against the artefact; boot error on the help page in UAT. |
| Rollback steps | 1. Revert the merge of `feature/IRIS-0900-angular-14-to-15` on `develop` via a revert PR. 2. If the artefact was published: leave it in `cswt-generic` (immutable) and do not vendor it; retail-web stays on 1.9.4. 3. If already vendored by retail-web: retail-web re-vendors 1.9.4 under their CHG. |
| Rollback duration | 15 minutes (revert PR); retail-web re-vendor per their runbook. |
| Point of no return | None for this CHG. The artefact is inert until vendored. |
| Rollback tested in uat on | not applicable (revert is a git operation; vendoring is retail-web's tested step). |

## 9. AI-assisted changes

| | |
|---|---|
| AI-assisted content present | Yes |
| Tool(s) and approved-tool register entry | Devin (Cognition), register entry AIT-014 (TECH-POL-031) |
| Commits or PRs carrying the `AI-Assisted:` trailer | Commits from `1b311c7` onwards on `feature/IRIS-0900-angular-14-to-15` carry `AI-Assisted: AIT-014` / `AI-Assisted-Scope:`; the first six (`d5735fa`, `7664500`, `740aae8`, `7dc950a`, `0b91eaa`, `4942df4`) carry only `Co-Authored-By` (history not rewritten; see REPORT.md s2 and s10.7). PR description carries the **AI-assisted content** section for the whole branch. |
| Human reviewer(s) of the AI-assisted content (not the prompter) | TBC (retail-digital reviewer + `@northgate/cswt-architecture` + `@northgate/gis-appsec`) |
| Review evidence | PR review with `northgate-platform-tooling/docs/templates/PR_REVIEW_AI.md` checklist completed (to be linked) |
| Scanner results for AI-assisted files specifically | same as section 6 (whole repository); Sonar / Checkmarx from the PR pipeline |

## 10. Post implementation

- Hypercare owner and duration: retail-digital (business hours) for 48 hours after retail-web vendors; nothing to watch after the publish itself.
- Success criteria: artefact in `cswt-generic/iris-widget/<version>/` with `iris.manifest.json` `angular: 15.2.10`, `zoneJsCompatible: 0.12.0`; `harness:check` green in the pipeline; retail-web host verification green with their Zone.
- Monitoring dashboards to watch: retail-web help page "chat unavailable" tile rate (their Splunk dashboard) after vendoring.
- PIR required: No (no deployment) unless rollback is triggered after vendoring.

## 11. Approvals

| role | name | date |
|---|---|---|
| Change owner | TBC | |
| Technical approver (not on the requesting team) | TBC (`@northgate/cswt-architecture`) | |
| GIS approver (section 6 carries accepted findings and 3 new dev-only ids pending KAN-32) | TBC (`@northgate/gis-appsec`) | |
| Business approver | TBC (Medium) | |
| CAB chair | | |
