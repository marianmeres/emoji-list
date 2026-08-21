# @marianmeres/emoji-list

[![NPM](https://img.shields.io/npm/v/@marianmeres/emoji-list)](https://www.npmjs.com/package/@marianmeres/emoji-list)
[![JSR](https://jsr.io/badges/@marianmeres/emoji-list)](https://jsr.io/@marianmeres/emoji-list)
[![License](https://img.shields.io/npm/l/@marianmeres/emoji-list)](LICENSE)

Complete list of emojis compiled into plain object maps, with search and conversion helpers. Useful as a low level building block for emoji processing tools.

Data is generated from the official Unicode
[emoji-test.txt](https://unicode.org/Public/emoji/latest/emoji-test.txt)
(currently **v17.0**, 1918 emojis). Default skin tone only.

## Installation

```bash
npm i @marianmeres/emoji-list
```

```bash
deno add jsr:@marianmeres/emoji-list
```

## Quick Start

```typescript
import { emojiToKey, keyToEmoji, searchEmoji } from "@marianmeres/emoji-list";

emojiToKey("💩"); // "pileOfPoo"
keyToEmoji("pileOfPoo"); // "💩"

searchEmoji("wales");
// [{
//     key: "flagWales",
//     emoji: "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
//     name: "flag: Wales",
//     group: "flags",
//     subgroup: "subdivision-flag",
// }]
```

## Raw data maps

```typescript
import {
	emojiCodeMap, //         { "1f600": "grinningFace", ... }
	emojiFulltextMap, //     { "grinningFace": "grinning face", ... }
	emojiGroupToKeyMap, //   { "smileys and emotion": ["grinningFace", ...], ... }
	emojiKeyMap, //          { "grinningFace": "1f600", ... }
	emojiKeyToGroupMap, //   { "grinningFace": ["smileys and emotion", "face-smiling"], ... }
} from "@marianmeres/emoji-list";
```

## API

See [API.md](API.md) for complete API documentation.

## Interactive example

A small browser app — live search, group browsing, and key/hex inspection of
every emoji — lives in [example/](example/):

```bash
deno task example:build && deno task example:serve
# → http://localhost:8000/
```

## License

[MIT](LICENSE)
