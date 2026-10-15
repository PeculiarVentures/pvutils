<h1 align="center">
  pvutils
</h1>

<div align="center">

![NPM License](https://img.shields.io/npm/l/pvutils)
![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/PeculiarVentures/pvutils/publish.yml?branch=master&label=publish)
[![npm version](https://img.shields.io/npm/v/pvutils.svg)](https://www.npmjs.com/package/pvutils)
![Coveralls](https://img.shields.io/coverallsCoverage/github/PeculiarVentures/pvutils)
[![npm downloads](https://img.shields.io/npm/dm/pvutils.svg)](https://www.npmjs.com/package/pvutils)

</div>

`pvutils` is a set of common utility functions used in various Peculiar Ventures Javascript based projects.

Some example capabilities included in `pvutils` include:

- Converting dates into UTC,
- Converting an "ArrayBuffer" into a hexdecimal string,
- Converting a number from 2^base to 2^10,
- Converting a number from 2^10 to 2^base,
- Concatenate two ArrayBuffers,
- And more...

## Install

```bash
npm install pvutils
```

## Breaking Changes In v2

v2 ships ESM only. The CommonJS build is removed: v1 published `build/utils.js` (CommonJS) and `build/utils.es.js` (ESM); v2 publishes a single ES module, `build/index.js`, with `build/index.d.ts`, behind an `exports` map.

- **Node.js `^20.19.0 || >=22.12.0` is required** (previously `>=16`). These versions support `require()` of ES modules, so CommonJS code can keep using `require("pvutils")` without changes. Node.js 22.0–22.11 is not supported: it can't `require()` ESM.
- **TypeScript projects that compile to CommonJS** need `"module": "node20"` or `"nodenext"` (TypeScript 5.9+). With `"module": "node16"` the compiler reports TS1479.
- **ESM and bundler setups** (`"module": "preserve"`, `"moduleResolution": "bundler"`) work without changes.
- **Legacy `"moduleResolution": "node"` (node10)** resolves the package through `types`; pvutils has no subpath exports, so nothing else changes.
- **Jest in CommonJS mode** can't load ESM packages. Use Jest's ESM mode, add `pvutils` to the `transformIgnorePatterns` exceptions, or switch to Vitest.
- **Deep imports are blocked.** The `exports` map allows only `pvutils` and `pvutils/package.json`. Imports of `pvutils/build/utils.js` or `pvutils/build/utils.es.js` must change to `pvutils`.

The public API is unchanged; only packaging and runtime requirements changed.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, commit conventions and the release flow.
