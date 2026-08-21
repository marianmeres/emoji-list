# AGENTS.md - Machine-Readable Project Documentation

## Package Identity

```yaml
name: "@marianmeres/emoji-list"
version: "2.0.0"
license: "MIT"
author: "Marian Meres"
repository: "https://github.com/marianmeres/emoji-list"
registry_npm: "https://www.npmjs.com/package/@marianmeres/emoji-list"
registry_jsr: "https://jsr.io/@marianmeres/emoji-list"
```

## Purpose

Complete list of emojis compiled into plain object maps, with search and conversion helpers. A low level data package for emoji processing tools. Data is generated from the official Unicode `emoji-test.txt` (currently v17.0, 1918 entries). Zero runtime dependencies.

## Architecture

### File Structure

```
src/
├── mod.ts              # Entry point (re-exports from emoji-list.ts)
├── emoji-list.ts       # Public API: helpers + re-exports of data modules
└── data/               # GENERATED - do not edit by hand
    ├── key-map.ts      # emojiKeyMap: key → hex
    ├── code-map.ts     # emojiCodeMap: hex → key
    ├── groups.ts       # emojiKeyToGroupMap, emojiGroupToKeyMap
    ├── fulltext.ts     # emojiFulltextMap: key → full text name
    └── version.ts      # EMOJI_DATA_VERSION
tests/
└── emoji-list.test.ts  # Full test suite
scripts/
├── build-data.ts       # Generates src/data/* from emoji-test.txt
├── build-npm.ts        # npm build script (@marianmeres/npmbuild)
├── gen-example-theme.ts    # Regenerates example/theme.css (design-tokens)
├── gen-example-version.ts  # Writes example/src/version.generated.ts (gitignored)
└── data/
    └── emoji-test.txt  # Unicode source data (versioned; excluded from JSR publish)
example/                # Interactive browser demo (excluded from JSR publish)
├── index.html          # Markup (<template>s) + token-driven inline styles
├── src/main.ts         # App logic (@marianmeres/vanilla)
├── reboot.css          # Bootstrap Reboot element reset (consumes --bs-* vars)
├── theme.css           # GENERATED - design-tokens "zinc" theme + reboot bridge
└── dist/bundle.js      # GENERATED - bundled app (committed for static hosting)
.npm-dist/              # Generated npm distribution (gitignored)
deno.json               # Deno configuration, version, tasks
```

### Example App

`example/` is a live emoji explorer (search, group browsing, key/hex detail)
following the ecosystem example convention: `@marianmeres/vanilla` for
reactivity/DOM, `@marianmeres/design-tokens` (+ Reboot bridge) for styling,
`@marianmeres/deno-build` for bundling. It imports the package via relative
`../../src/mod.ts`, so it always runs against local source. `theme.css` and
`dist/bundle.js` are generated (via `example:theme` / `example:build`) but
committed; `src/version.generated.ts` is generated and gitignored.

### Data Pipeline

```
scripts/data/emoji-test.txt (Unicode, CLDR order)
  → scripts/build-data.ts parses lines:
      "1F600 ; fully-qualified # 😀 E1.0 grinning face"
      "# group: ..." / "# subgroup: ..." headers set current groups
  → includes only `fully-qualified` and `component` statuses
  → excludes skin tone modifiers/variants (code points 1F3FB–1F3FF)
  → derives camelCase key from name (see Key Derivation)
  → writes typed src/data/*.ts modules
```

### Key Derivation

`"flag: Wales"` → `flagWales`. Algorithm (in `build-data.ts`): unaccent (NFD strip combining marks), replace `#`→`hash`, `*`→`star`, `&`→`and`, strip apostrophes, non-word chars to spaces, PascalCase words, lcfirst.

Hex ids are lowercase dash-joined code points of the fully-qualified form (eg `smilingFace` → `263a-fe0f`, includes `fe0f`).

## Critical Conventions

1. **Never hand-edit `src/data/*`** — regenerate via `deno task build:data`
2. Generated exports carry explicit type annotations (JSR no-slow-types requirement)
3. Default skin tone only — skin tone sequences are intentionally excluded
4. `emojiToKey` must stay FE0F-tolerant (falls back to a lazily built variation-selector-stripped lookup)
5. `emojiToKey` returns `null` when not found; `keyToEmoji`/`hexToEmoji` return `""`
6. Data updates: `deno run -A scripts/build-data.ts --download` fetches the latest Unicode data; a data version bump is a potentially breaking change (Unicode occasionally renames emojis, eg `flagTurkey` → `flagTurkiye` in v16)

## Before Making Changes

- [ ] Read existing patterns in [src/emoji-list.ts](src/emoji-list.ts)
- [ ] Run tests: `deno task test`
- [ ] After touching `scripts/build-data.ts`, run `deno task build:data` and inspect the key diff
- [ ] Update tests, README.md and API.md for any API changes
- [ ] Update AGENTS.md if public API or pipeline changes

## Public API

All exports from `src/mod.ts`:

| Export               | Type                               | Description                                           |
| -------------------- | ---------------------------------- | ----------------------------------------------------- |
| `emojiToKey(emoji)`  | `(string) => string \| null`       | Emoji char → key, FE0F-tolerant                       |
| `keyToEmoji(key)`    | `(string) => string`               | Key → emoji char (`""` if unknown)                    |
| `searchEmoji(query)` | `(string) => EmojiSearchResult[]`  | Case-insensitive substring search over names and keys |
| `emojiToHex(emoji)`  | `(string) => string`               | Emoji char → dash-joined lowercase hex                |
| `hexToEmoji(hex)`    | `(string) => string`               | Hex id → emoji char (invalid segments ignored)        |
| `emojiKeyMap`        | `Record<string, string>`           | key → hex                                             |
| `emojiCodeMap`       | `Record<string, string>`           | hex → key                                             |
| `emojiFulltextMap`   | `Record<string, string>`           | key → full text name                                  |
| `emojiKeyToGroupMap` | `Record<string, [string, string]>` | key → `[group, subgroup]`                             |
| `emojiGroupToKeyMap` | `Record<string, string[]>`         | `group` or `group/subgroup` → keys                    |
| `EMOJI_DATA_VERSION` | `string`                           | Unicode data version (eg `"17.0"`)                    |
| `EmojiSearchResult`  | `interface`                        | `{ key, emoji, name, group, subgroup }`               |

See [API.md](API.md) for full signatures and examples.

## Commands

| Task                           | Command                                                             |
| ------------------------------ | ------------------------------------------------------------------- |
| Run tests                      | `deno task test`                                                    |
| Run tests (watch)              | `deno task test:watch`                                              |
| Regenerate data                | `deno task build:data`                                              |
| Regenerate from latest Unicode | `deno run -A scripts/build-data.ts --download && deno fmt src/data` |
| Build example bundle           | `deno task example:build`                                           |
| Example dev mode (watch)       | `deno task example:dev`                                             |
| Serve example locally          | `deno task example:serve` (→ http://localhost:8000/)                |
| Regenerate example theme       | `deno task example:theme [themeName\|--list]`                       |
| Build npm package              | `deno task npm:build`                                               |
| Publish (JSR + npm)            | `deno task publish`                                                 |
| Release + publish              | `deno task rp` (patch) / `deno task rpm` (minor)                    |

## Dependencies

### Production

None.

### Development

- `@marianmeres/npmbuild` - npm build helper
- `@marianmeres/vanilla` - Example app reactivity/DOM helpers
- `@marianmeres/design-tokens` - Example app theme generation
- `@marianmeres/deno-build` - Example app bundler (invoked via `jsr:` specifier in tasks)
- `@std/assert` - Testing assertions
- `@std/fs`, `@std/path` - Build script utilities

## Test Coverage

7 test steps in [tests/emoji-list.test.ts](tests/emoji-list.test.ts): data sanity (counts, version format), raw map lookups, key/emoji round-trips (simple, ZWJ, tag sequences), FE0F tolerance, hex conversions, search behavior, modern-data presence and skin-tone exclusion.

## Version History

- **2.0.0** — Deno-first rewrite (JSR + npm). Data updated Unicode v15.0 → v17.0 (+45 emojis). Added `searchEmoji`, `emojiToHex`, `hexToEmoji`, `EMOJI_DATA_VERSION`, FE0F-tolerant `emojiToKey`. Hex ids now use fully-qualified forms (include `fe0f`). Renames from Unicode: `flagTurkey` → `flagTurkiye`; removed bogus `cLDRShortName` entry (old parser bug).
- **1.x** — npm-only, Node build script, Unicode v15.0 data scraped from HTML charts.
