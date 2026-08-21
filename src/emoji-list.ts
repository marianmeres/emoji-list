import { emojiCodeMap } from "./data/code-map.ts";
import { emojiFulltextMap } from "./data/fulltext.ts";
import { emojiKeyToGroupMap } from "./data/groups.ts";
import { emojiKeyMap } from "./data/key-map.ts";

export { emojiCodeMap } from "./data/code-map.ts";
export { emojiFulltextMap } from "./data/fulltext.ts";
export { emojiGroupToKeyMap, emojiKeyToGroupMap } from "./data/groups.ts";
export { emojiKeyMap } from "./data/key-map.ts";
export { EMOJI_DATA_VERSION } from "./data/version.ts";

/** Search result item returned by `searchEmoji`. */
export interface EmojiSearchResult {
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

/** Converts an emoji character to its hex codes id (eg `💩` -> `1f4a9`). */
export function emojiToHex(emoji: string): string {
	return [...emoji]
		.map((char) => (char.codePointAt(0) ?? 0).toString(16))
		.join("-");
}

/** Converts a hex codes id to the actual emoji character (eg `1f4a9` -> `💩`). */
export function hexToEmoji(hex: string): string {
	return hex
		.split("-")
		.map((h) => parseInt(h, 16))
		.filter((n) => Number.isFinite(n) && n >= 0 && n <= 0x10ffff)
		.map((n) => String.fromCodePoint(n))
		.join("");
}

const FE0F = "fe0f";
const _stripFe0f = (hex: string) => hex.split("-").filter((h) => h !== FE0F).join("-");

// lazily built variation-selector-insensitive lookup
let _strippedCodeMap: Record<string, string> | null = null;

/**
 * Converts an emoji character to its key (eg `💩` -> `pileOfPoo`).
 * Returns `null` if not found.
 *
 * Tolerates missing or extra `FE0F` variation selectors (eg both `☺` and `☺️`
 * resolve to `smilingFace`).
 */
export function emojiToKey(emoji: string): string | null {
	const hex = emojiToHex(emoji);
	if (emojiCodeMap[hex]) return emojiCodeMap[hex];

	_strippedCodeMap ??= Object.fromEntries(
		Object.entries(emojiCodeMap).map(([h, key]) => [_stripFe0f(h), key]),
	);
	return _strippedCodeMap[_stripFe0f(hex)] ?? null;
}

/**
 * Converts a key to the actual emoji character (eg `pileOfPoo` -> `💩`).
 * Returns an empty string if not found.
 */
export function keyToEmoji(key: string): string {
	return hexToEmoji(emojiKeyMap[key] ?? "");
}

/**
 * Case-insensitive substring search over emoji names and keys.
 *
 * ```ts
 * searchEmoji("wales");
 * // [{ key: "flagWales", emoji: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", name: "flag: Wales", group: "flags", subgroup: "subdivision-flag" }]
 * ```
 */
export function searchEmoji(query: string): EmojiSearchResult[] {
	const q = `${query}`.trim().toLowerCase();
	if (!q) return [];

	const out: EmojiSearchResult[] = [];
	for (const [key, name] of Object.entries(emojiFulltextMap)) {
		if (name.toLowerCase().includes(q) || key.toLowerCase().includes(q)) {
			const [group, subgroup] = emojiKeyToGroupMap[key] ?? ["", ""];
			out.push({ key, emoji: keyToEmoji(key), name, group, subgroup });
		}
	}
	return out;
}
