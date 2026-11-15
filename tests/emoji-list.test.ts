import { assert, assertEquals } from "@std/assert";
import {
	EMOJI_DATA_VERSION,
	emojiCodeMap,
	emojiFulltextMap,
	emojiGroupToKeyMap,
	emojiKeyMap,
	emojiKeyToGroupMap,
	emojiToHex,
	emojiToKey,
	hexToEmoji,
	keyToEmoji,
	searchEmoji,
} from "../src/mod.ts";

Deno.test("data sanity", () => {
	const count = Object.keys(emojiKeyMap).length;
	assert(count > 1900, `count: ${count}`);
	assertEquals(count, Object.keys(emojiCodeMap).length);
	assertEquals(count, Object.keys(emojiKeyToGroupMap).length);
	assertEquals(count, Object.keys(emojiFulltextMap).length);
	assert(/^\d+\.\d+$/.test(EMOJI_DATA_VERSION));
});

Deno.test("maps", () => {
	assertEquals(emojiKeyMap.grinningFace, "1f600");
	assertEquals(emojiCodeMap["1f600"], "grinningFace");
	assertEquals(emojiFulltextMap.grinningFace, "grinning face");
	assertEquals(emojiKeyToGroupMap.grinningFace, [
		"smileys and emotion",
		"face-smiling",
	]);
	assert(emojiGroupToKeyMap["smileys and emotion"].includes("grinningFace"));
	assert(
		emojiGroupToKeyMap["smileys and emotion/face-smiling"].includes(
			"grinningFace",
		),
	);
});

Deno.test("emojiToKey and keyToEmoji", () => {
	assertEquals(emojiToKey("💩"), "pileOfPoo");
	assertEquals(keyToEmoji("pileOfPoo"), "💩");

	// zwj sequence
	assertEquals(emojiToKey("🐕‍🦺"), "serviceDog");
	assertEquals(keyToEmoji("serviceDog"), "🐕‍🦺");

	// tag sequence
	assertEquals(emojiToKey("🏴󠁧󠁢󠁷󠁬󠁳󠁿"), "flagWales");
	assertEquals(keyToEmoji("flagWales"), "🏴󠁧󠁢󠁷󠁬󠁳󠁿");

	// not found
	assertEquals(emojiToKey("no emoji"), null);
	assertEquals(keyToEmoji("noSuchKey"), "");
});

Deno.test("emojiToKey is variation selector tolerant", () => {
	// with and without FE0F
	assertEquals(emojiToKey("☺️"), "smilingFace");
	assertEquals(emojiToKey("☺"), "smilingFace");
});

Deno.test("emojiToHex and hexToEmoji", () => {
	assertEquals(emojiToHex("💩"), "1f4a9");
	assertEquals(hexToEmoji("1f4a9"), "💩");
	assertEquals(hexToEmoji("xyz"), "");
});

Deno.test("searchEmoji", () => {
	const results = searchEmoji("pile of");
	assertEquals(results.length, 1);
	assertEquals(results[0], {
		key: "pileOfPoo",
		emoji: "💩",
		name: "pile of poo",
		group: "smileys and emotion",
		subgroup: "face-costume",
	});

	// matches keys too (case-insensitive)
	assert(searchEmoji("OFPOO").some((r) => r.key === "pileOfPoo"));

	// empty-ish query
	assertEquals(searchEmoji(""), []);
	assertEquals(searchEmoji("   "), []);
});

Deno.test("includes modern emoji data", () => {
	// E16.0
	assertEquals(emojiToKey("🫩"), "faceWithBagsUnderEyes");
	// default skin tone only
	assertEquals(emojiToKey("👋🏿"), null);
});

Deno.test("keyToEmoji ignores inherited Object.prototype properties", () => {
	for (const key of Object.getOwnPropertyNames(Object.prototype)) {
		assertEquals(keyToEmoji(key), "", key);
	}
});
