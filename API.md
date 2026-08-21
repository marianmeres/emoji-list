# API

Complete API reference for `@marianmeres/emoji-list`.

Terminology used below:

- **key** — camelCase emoji identifier derived from its Unicode name (eg `pileOfPoo`, `flagWales`)
- **hex** — lowercase dash-joined hex code points (eg `1f4a9`, `1f3f4-e0067-e0062-e0077-e006c-e0073-e007f`)

## Functions

### `emojiToKey(emoji)`

Converts an emoji character to its key. Tolerates missing or extra `FE0F` variation selectors (eg both `☺` and `☺️` resolve to `smilingFace`).

**Parameters:**

- `emoji` (string) — The emoji character (may be a multi code point sequence)

**Returns:** `string | null` — The key, or `null` if not found

**Example:**

```typescript
emojiToKey("💩"); // "pileOfPoo"
emojiToKey("🐕‍🦺"); // "serviceDog"
emojiToKey("not an emoji"); // null
```

---

### `keyToEmoji(key)`

Converts a key to the actual emoji character.

**Parameters:**

- `key` (string) — The emoji key

**Returns:** `string` — The emoji character, or an empty string if not found

**Example:**

```typescript
keyToEmoji("pileOfPoo"); // "💩"
keyToEmoji("noSuchKey"); // ""
```

---

### `searchEmoji(query)`

Case-insensitive substring search over emoji names and keys.

**Parameters:**

- `query` (string) — The search term

**Returns:** `EmojiSearchResult[]` — Matching emojis (empty array for an empty query or no match)

**Example:**

```typescript
searchEmoji("pile of");
// [{
//     key: "pileOfPoo",
//     emoji: "💩",
//     name: "pile of poo",
//     group: "smileys and emotion",
//     subgroup: "face-costume",
// }]
```

---

### `emojiToHex(emoji)`

Converts an emoji character to its hex id.

**Parameters:**

- `emoji` (string) — The emoji character

**Returns:** `string` — Lowercase dash-joined hex code points

**Example:**

```typescript
emojiToHex("💩"); // "1f4a9"
```

---

### `hexToEmoji(hex)`

Converts a hex id to the actual emoji character. Invalid segments are ignored.

**Parameters:**

- `hex` (string) — Dash-joined hex code points

**Returns:** `string` — The emoji character

**Example:**

```typescript
hexToEmoji("1f4a9"); // "💩"
```

---

## Data maps

All maps are plain objects generated from the Unicode `emoji-test.txt` data file. Only `fully-qualified` and `component` entries with default skin tone are included.

### `emojiKeyMap`

`Record<string, string>` — key to hex.

```typescript
emojiKeyMap.grinningFace; // "1f600"
```

### `emojiCodeMap`

`Record<string, string>` — hex to key.

```typescript
emojiCodeMap["1f600"]; // "grinningFace"
```

### `emojiFulltextMap`

`Record<string, string>` — key to full text name.

```typescript
emojiFulltextMap.grinningFace; // "grinning face"
```

### `emojiKeyToGroupMap`

`Record<string, [string, string]>` — key to `[group, subgroup]`.

```typescript
emojiKeyToGroupMap.grinningFace; // ["smileys and emotion", "face-smiling"]
```

### `emojiGroupToKeyMap`

`Record<string, string[]>` — group (as `group` or `group/subgroup`) to list of keys.

```typescript
emojiGroupToKeyMap["smileys and emotion"]; // ["grinningFace", ...]
emojiGroupToKeyMap["smileys and emotion/face-smiling"]; // ["grinningFace", ...]
```

---

## Constants

### `EMOJI_DATA_VERSION`

`string` — The Unicode Emoji data version the maps were generated from (eg `"17.0"`).

---

## Types

### `EmojiSearchResult`

```typescript
interface EmojiSearchResult {
	/** Emoji key (eg `pileOfPoo`). */
	key: string;
	/** The actual emoji character (eg `💩`). */
	emoji: string;
	/** Full text name (eg `pile of poo`). */
	name: string;
	/** Major group (eg `smileys and emotion`). */
	group: string;
	/** Minor group (eg `face-costume`). */
	subgroup: string;
}
```
