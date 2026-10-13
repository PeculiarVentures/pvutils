# Contributing

## Development

Requires Node.js 24 (the version used in CI) and npm 10+.

```sh
npm ci
```

| Script                 | Description                                       |
| ---------------------- | ------------------------------------------------- |
| `npm run build`        | Build `build/` with tsdown (ESM, CJS, types)      |
| `npm test`             | Run tests with vitest                             |
| `npm run coverage`     | Run tests with coverage                           |
| `npm run lint`         | Lint with oxlint (`lint:fix` to autofix)          |
| `npm run format:check` | Check formatting with oxfmt (`format` to rewrite) |
| `npm run typecheck`    | Type-check with `tsc --noEmit`                    |
| `npm run check:es`     | Verify build output is ES2019-compatible          |

The published package supports Node.js >= 12, so the build output must stay ES2019. Run `npm run build && npm run check:es` after changes that may use newer syntax or APIs.

`npm run build` also regenerates the `exports` field in `package.json`. Commit that change if it appears; CI fails when the generated exports differ from the committed ones.

## Pull requests

- Use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) for commit messages and PR titles, e.g. `fix: handle empty input`, `feat(convert): add base64url helpers`. Mark breaking changes with `!` (`feat!: ...`) and/or a `BREAKING CHANGE:` footer.
- `feat`, `fix`, `perf` and breaking changes appear in `CHANGELOG.md`. Other types (`chore`, `ci`, `docs`, `test`, ...) are omitted, so choose the type carefully.
- The **Test** workflow must pass: lint, format, typecheck, build, exports check, ES compatibility, tests with coverage.
- Do not bump the version or edit `CHANGELOG.md` in feature PRs; the release flow handles both.

## Release flow

Releases are made in two steps by two GitHub Actions workflows. Nothing is published from a local machine.

```text
Version Bump (manual) ──► release PR ──► review & merge ──► Release (automatic) ──► npm + tag + GitHub Release
```

### 1. Version Bump (`.github/workflows/version-bump.yml`)

Run it from **Actions → Version Bump → Run workflow** on `master` and choose `patch`, `minor` or `major`. It:

1. Bumps the version in `package.json` and `package-lock.json`.
2. Prepends a section for the new version to `CHANGELOG.md`, generated with `conventional-changelog -p angular` from commits since the last `v*` tag.
3. Opens (or updates) a PR from the `release/version-bump` branch titled `chore(release): vX.Y.Z`.

Choose the bump type from the commits since the last release: `major` if any are breaking, `minor` if any are `feat`, otherwise `patch`.

Review the PR: check the version, and edit the `CHANGELOG.md` section on the branch if wording needs fixing. That section becomes the GitHub Release notes.

> PRs opened with the default `GITHUB_TOKEN` do not trigger other workflows. Set a `RELEASE_TOKEN` repository secret (a token with `contents` and `pull-requests` write access) so the **Test** workflow runs on the release PR.

### 2. Release (`.github/workflows/release.yml`)

Runs on every push to `master` that changes `package.json`. A `check` job reads the version and looks for a GitHub Release `vX.Y.Z`; if it already exists, the workflow stops. Otherwise the `publish` job, in the `npm` environment:

1. Runs lint, format check, typecheck, tests, build, the exports check and the ES compatibility check.
2. Extracts the `X.Y.Z` section from `CHANGELOG.md` and fails if there is none.
3. Publishes to npm via [Trusted Publishing](https://docs.npmjs.com/trusted-publishers) (OIDC, no npm token), skipping the step if that version is already on npm.
4. Pushes the `vX.Y.Z` tag (reusing it if it already exists) and force-moves the major tag (e.g. `v2`) to it.
5. Creates the GitHub Release `vX.Y.Z` with the extracted notes.

The GitHub Release is created last, so a failed run can be retried with **Re-run jobs**: steps that already completed are skipped.

### Setup

- npm package settings → Trusted Publisher: repository `PeculiarVentures/pvutils`, workflow `release.yml`, environment `npm`.
- GitHub repository settings → Environments: an `npm` environment (add required reviewers to gate publishing).
- Optional: the `RELEASE_TOKEN` secret described above.
