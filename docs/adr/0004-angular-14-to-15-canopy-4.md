<!-- Generated with AI assistance (AIT-014) on 2026-09-09; reviewed by <handle>. -->
# ADR 0004: Angular 14 -> 15 on Canopy 4.0.0, one major, host Zone contract unchanged

Status: proposed, 2026-09-09 (IRIS-0900, estate wave KAN-23). retail-digital. For review by
cswt-architecture (CODEOWNERS on `docs/adr/`).

## Context

Iris is on Angular 14.3.0, whose vendor support ended 2023-11-18; the estate acceptance TR-1203
expires 2026-11-18 and cannot be renewed (FRAMEWORK_SUPPORT_STANDARD s6). The estate is moving
Angular 14 -> 15 as a wave: Canopy 4.0.0 first (CNPY-2140: Angular 15, Material MDC, typography
levels renamed, flex-layout removed), then the consumers. Iris pins `@northgate/canopy-ui` 3.7.2,
whose peers are `@angular/* ^14.0.0`; Canopy 4.0.0's are `^15.0.0`. There is no Canopy that spans
both majors, so the Canopy pin and the framework hop cannot be separated into two releases.

ADR 0002 couples the widget's Angular to the **host's** Zone.js: retail-web (the only host) loads
zone.js 0.11.8 with Angular 14.3.0 and the widget uses whatever Zone it finds. The 2024 retrospective
note on ADR 0002 says "when the host moves 15+, read this first". The host has not moved yet
(MOL-4471 is their hop); the widget is going first, so the question is whether Angular 15 runs on the
host's 0.11.8, not the other way round.

Options considered for the framework side:

1. Angular 15.2.x + Canopy 4.0.0, one major, widget before host. Requires Angular 15 to accept
   zone.js 0.11.8 at runtime.
2. Chain 15 -> 16 (or further) in the same branch to shorten the wave. Rejected by the playbook
   (one major at a time) and by Canopy: there is no Canopy 5 yet, so 16 has nothing to pin.
3. Wait for retail-web to move first and do both together in lockstep as ADR 0002 assumed. Rejected:
   the acceptance ceiling is the same for both and the host's hop is larger; the widget moving first
   de-risks theirs (they only need to re-vendor).
4. Decouple via iframe or zoneless bootstrap so the Zone question goes away. Both rejected again for
   the ADR 0001 / ADR 0002 reasons; each is a project, not a hop.

## Decision

Option 1.

- `@northgate/canopy-ui` 4.0.0, exact, is the first commit of the hop (library before consumer;
  never newer than the library: Angular 15.2.10 is inside Canopy's `^15.0.0`).
- Angular 15.2.10 (last 15.x), CLI 15.2.11, Material/CDK 15.2.9, `@angular/elements` 15.2.10,
  TypeScript 4.9.5, angular-eslint 15.2.1, `ngx-build-plus` 15.0.0. RxJS 7.5.7 and Node 16.20.2
  unchanged. Nothing from 16.x enters the lockfile. Everything exact (DEPENDENCY_POLICY).
- Material 15 means MDC. Iris takes MDC through Canopy 4 (`CnButtonModule`, `CnIconButtonModule`,
  `CnToastModule`, `CnIconModule`, tokens) and imports `MatButtonModule` from `@angular/material/button`
  (MDC), **not** `@angular/material/legacy-button`, which the Material schematic proposed: Iris has no
  `mat-button` in its templates, so there is nothing to keep on the legacy line, and Canopy 4 forbids
  reaching into Material internals (canopy-ui ADR 0004). No `.mat-*` selector is overridden in Iris.
- The Canopy 4 `canopy-4-theme-mixin` schematic was run; Iris has no Canopy typography includes, so
  it changed nothing. Canopy 4's dense (`-2`) density is not used (KAN-34). `cn-amount-slider` and
  `cn-filter-chips` are not used (KAN-27 / KAN-28 do not reach Iris).
- **Host Zone contract unchanged.** `polyfills.ts` stays `export {};`, `main.ts` still refuses to
  boot without the host's Zone, `postbuild.js` still fails a bundle that defines `Zone`. The widget's
  own `zone.js` pin moves 0.11.8 -> 0.12.0 for unit tests, the dev shell and the harness asset only.
  `@angular/core@15.2.10` declares `zone.js ~0.11.4 || ~0.12.0 || ~0.13.0`, so retail-web's 0.11.8 is
  inside range, and this was verified rather than assumed: the production bundle was mounted in a
  reproduction of the retail-web host page (their CSP, their `zone-flags`, their zone.js 0.11.8 from
  their pin, load order as in their `polyfills.ts`) and registered, rendered, kept the host's Zone
  object and produced no `Zone already loaded` (`docs/upgrade/IRIS-0900/14-to-15/CONSUMERS.md`).
- `iris.manifest.json` `zoneJsCompatible` is now written (`0.12.0`). It had been documented since 1.9.2
  but `postbuild.js` read `devDependencies`, where `zone.js` has never lived. The field means "built
  and unit-tested with"; the range the bundle actually accepts is Angular's peer range above, and the
  README says both.
- The single content-hashed bundle plus `iris.js` and manifest (ADR 0003) is unchanged; the budgets in
  `angular.json` (900 kB warn / 1400 kB error) are unchanged and pass at 468.95 kB initial.

## Consequences

- The widget is on Angular 15 while its host is on Angular 14 with zone.js 0.11.8. That is supported
  by Angular's own peer range and by the host verification, but it is a **state ADR 0002 did not
  anticipate** (it assumed the host moves first or both move together). The release runbook step
  "do not tag until retail-web confirm their Zone matches `zoneJsCompatible`" now needs a human
  decision rather than an equality check: 0.11.8 != 0.12.0, and the evidence says it works. Recorded
  as a decision not made in `docs/upgrade/IRIS-0900/14-to-15/REPORT.md` s10; the runbook wording is
  left for that decision.
- When retail-web moves to Angular 15 (zone.js 0.12.x or 0.13.x) the widget needs no rebuild: both
  are in range. Re-run the host check with their new pin; that is all.
- Bundle +40 kB raw / +8 kB gzip (MDC styles and Angular 15 runtime). Inside budget, but the growth
  is retail-web's to accept for the help page; not raised here.
- `cn-toast`, `cn-button` and `cn-icon-button` look different under MDC (focus ring, ripple, density,
  typography). No screenshot baseline exists in Iris; acceptance rides on the Canopy showcase (KAN-31)
  and the retail-web help page. Any change to the Canopy typography table (KAN-33) does not reach Iris
  (no local typography mixin) but a rebuild against the published 4.0.0 is still required before tag.
- Semver: the release runbook classes an Angular/Zone pairing change as a **major**, so the next tag
  is expected to be 2.0.0. `package.json` stays 1.9.4 on the branch; the bump is a release-time
  decision (runbook step 2).
- npm audit: production tree unchanged (17 carried Angular ids, fixes are Angular 17/19). Dev tree
  gains three high ids from `@angular/cli` 15.2.11 (`sigstore`, `browserslist`), the same three Canopy
  4 carries under KAN-32. They are not in the bundle. No `overrides` were added; the treatment is
  KAN-32's decision and until then the `npm audit` gate is red, honestly.
- Angular 15.2 itself is past vendor support (2024-05-18); this hop is an intermediate wave position,
  not a destination. 15 -> 16 follows once Canopy 5 exists, one major at a time, and gets its own ADR.
- The `useDefineForClassFields: false` / ES2022 target written by the CLI 15 migration must stay
  until the codebase is audited for field-initialisation order; the CLI forces both anyway.
- Anyone tempted to "fix" `polyfills.ts` because Angular 15 "needs zone.js 0.12" should read ADR 0002,
  the README "Zone.js and the host page", and the host-verification log. It does not, and
  `postbuild.js` will fail the build if you try.
