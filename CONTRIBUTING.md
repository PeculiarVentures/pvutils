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
- Pull requests are squash-merged, so the pull request title becomes the commit message and drives the version and the release notes.
- `feat`, `fix`, `perf`, `build`, `revert` and breaking changes trigger a release and appear in the release notes. Other types (`chore`, `ci`, `docs`, `test`, ...) do not, so choose the type carefully.
- The **Test** workflow must pass: lint, format, typecheck, build, exports check, tests with coverage.
- Do not bump the version in feature PRs; the release flow handles it.

## Releases

Releases are managed by [release-please](https://github.com/googleapis/release-please) (`release-please-config.json`, `.release-please-manifest.json`):

1. On every push to `master`, the **Publish** workflow first runs lint, format, typecheck, tests, and build (the **Test** workflow). Only when they pass does release-please open or update a `chore(release): vX.Y.Z` pull request that bumps `package.json`/`package-lock.json`. The version comes from the commits: a breaking change bumps major, `feat` bumps minor, and `fix`, `perf`, `build`, and `revert` bump patch. Other types do not trigger a release.
2. Merge the release pull request. release-please creates the `vX.Y.Z` tag and a GitHub Release with the notes from the pull request; the workflow then publishes that commit to npm via Trusted Publisher, with provenance, and moves the major tag (for example `v2`) when this is the newest release of that major.

To retry a failed npm publish, run **Publish** manually from the `vX.Y.Z` tag. Set the optional `RELEASE_TOKEN` secret (PAT or GitHub App token) so the Test workflow runs on the release pull request.

Release notes live only in [GitHub Releases](https://github.com/PeculiarVentures/pvutils/releases); there is no `CHANGELOG.md`. Only `feat`, `fix`, `perf`, `build`, `revert`, and breaking changes are listed. Force a version with a `Release-As: x.y.z` line in a commit body. To fix the notes for a merged change, add a `BEGIN_COMMIT_OVERRIDE` … `END_COMMIT_OVERRIDE` block with the corrected commit message to that pull request's description; edits to the release pull request description are overwritten when new commits land.

### Setup

- npm package settings → Trusted Publisher: repository `PeculiarVentures/pvutils`, workflow `publish.yml`, environment `npm`.
- GitHub repository settings → Actions → General: allow GitHub Actions to create and approve pull requests (release-please opens the release PR).
- GitHub repository settings → Environments: an `npm` environment (add required reviewers to gate publishing).
- Optional: the `RELEASE_TOKEN` secret described above.
