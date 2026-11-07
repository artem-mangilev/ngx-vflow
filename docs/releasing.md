# Releases

`ngx-vflow`, `@vflow/cli` and the extension packages (`@vflow/routing`) belong to one Nx Release
fixed group, selected by the `release` project tag. They always receive the same version and one
`v{version}` Git tag. `@vflow/ui` is not published (see below).
Existing `v2.7.0` history is retained. Nx determines the next shared version from conventional commits since that tag. Source versions remain at the last release until release time.

## Automatic version selection

- `feat: ...` → minor.
- `fix: ...`, `perf: ...`, `refactor: ...` → patch.
- `feat!: ...` (or another type with `!`) or a `BREAKING CHANGE:` footer → major.
- `docs: ...`, `chore: ...`, `test: ...`, etc. do not trigger a release on their own.

The highest required bump applies to **every** package tagged `release`, including unchanged
packages. If there are no release-worthy commits, no version is raised. Launching the release
workflow remains manual; calculating the version is automatic.

Commit scopes describe the change; they do not split the fixed release group. With squash
merges, use a conventional commit message for the final squash commit on `main`.
Record the Angular 20 migration as a breaking change, for example
`feat!: require Angular 20 and migrate to Nx`. Existing breaking commits already make the
current dry-run select 3.0.0 for both packages.

## Preview locally

```bash
nvm use
npm ci
npm run build:dev
npm run build
npm run release:dry-run
```

Nx builds production libraries before versioning, previews both source and distribution
manifest updates, the changelog, Git commit/tag and npm publications. Dry-run creates build
outputs but does not update source versions, create commits/tags or publish. No npm token is
needed for the preview; it does **not** prove npm authorization.

## Publish

1. Register or obtain access to npm scope `@vflow` (see below). Set repository secret
   `NPM_TOKEN` to a token able to publish **both** public packages, including the first
   publication in the scope. Configure its npm 2FA/automation permissions accordingly.
2. Merge the changes into `main` and wait for the `ci` workflow to pass.
3. Run GitHub Actions → `release` on `main`, leaving `dry_run=true`.
   No version input is required: Nx selects the highest bump from the relevant commits.
4. Review the two package names, identical versions, changelog and tarball contents.
   Run the same workflow with `dry_run=false` to publish both, then push the release commit/tag.
   The GitHub Actions token must be allowed to push the release commit to `main` under the
   repository's branch protection rules.

Do not publish `@vflow/ui` separately. npm has no atomic multi-package publication:
if a publish or Git push fails after one package succeeds, retain the exact release version,
inspect npm and the workflow log, and finish the missing publication/tag without bumping again.
Do not blindly rerun a version bump. `nx release publish --dry-run` previews publishing
already-built manifests; `nx release publish` publishes those versions, skipping existing ones.

## npm scope check (2026-09-06)

`@vflow/ui` is a valid scoped name. The public registry returned 404 for that package
and `404 {"error":"Scope not found"}` for `/-/org/vflow/package`.
`npm whoami` and `npm org ls vflow` returned 401 in this environment, so neither ownership
nor name reservation has been verified. A missing public package does not guarantee the
scope can be registered; complete organization registration on npm before the first release.
Nothing has been registered or published as part of this migration.

npm grants a scope matching a user or organization name; publishing in an organization's
scope requires access to that organization. See [npm scopes](https://docs.npmjs.com/about-scopes/)
and [publishing organization packages](https://docs.npmjs.com/creating-and-publishing-an-organization-scoped-package/).
The package manifests specify `publishConfig.access: public`.

## Add a package

`libs/routing` is the template: copy its `package.json`, `ng-package.json`, `project.json`,
`tsconfig.lib.json`, `tsconfig.lib.prod.json`, `tsconfig.spec.json`, `vitest.config.mts`, `LICENSE` and
`src/public-api.ts`, then:

1. In `package.json` set the name, the description and the source version to the current shared release
   version, keep `publishConfig.access: public`, `sideEffects: false` and the peer ranges of `ngx-vflow`
   and `@angular/core`. An extension package imports only the public API of `ngx-vflow`.
2. Keep the project tag `release` and the `nx-release-publish` target with `packageRoot: "dist/{projectRoot}"`.
3. Add the alias to the root `tsconfig.json` (`libs/<name>/src/public-api`) and to
   `apps/docs/tsconfig.hybrid.json` (`dist/libs/<name>`), so the hybrid docs build checks the built package.
   `vitest.shared.mts` reads the root aliases, so specs import `ngx-vflow` from source.
4. Add a page under the **Packages** docs category with a live demo, and an e2e spec in `apps/docs-e2e`.
5. Run `nx build <name>`, `nx test <name>`, `nx lint <name>`, the docs builds and the release dry-run. The tag
   selector includes the new package in CI builds and the shared release; no workflow package list is needed.

`libs/ui` is not published: `libs/cli` (`@vflow/cli`) ships its sources as generator templates, copied by
`ui:sync-cli` before `cli:build`, and consumers compile the copied parts with their own Tailwind v4.
The docs app compiles `apps/docs/src/vflow-ui-parts.css` with PostCSS.

## Documentation deployment

Run `deploy-docs` after setting GitHub Pages → Source to **GitHub Actions**.
Keep the custom domain `www.ngx-vflow.org` in repository Pages settings.
The workflow builds `docs` and uploads `dist/apps/docs/browser` using the official Pages actions.

## Migration verification (2026-09-06)

Verified locally on Node 22.20.0 with Angular 20.3.30, NgDoc 20.2.0, Nx 21.6.11 and Tailwind 4.3.3:

- Clean `npm ci`, dependency resolution, lint, Prettier and Nx configuration schemas passed.
- Development, production and hybrid builds passed, including `ngx-vflow/testing`.
- 217 unit tests and 13 browser tests passed. Separate production and hybrid UI smoke tests passed;
  hybrid uses the distribution JavaScript and precompiled CSS.
- `npm run release:dry-run` previewed 3.0.0 for both packages and completed both
  npm publication dry-runs. Source versions and Git tags were unchanged.
- Actual tarballs installed into a separate consumer with Angular **20.0.0**. TypeScript checked
  imports of both packages and `ngx-vflow/testing`; the UI tarball contained compiled CSS.

Production builds retain third-party CommonJS warnings. `npm ci` also reported 38 npm audit
findings (14 moderate, 24 high); this migration does not claim to resolve the dependency security backlog.
Live npm authorization and GitHub-hosted workflow execution were not verified locally.
