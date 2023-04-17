import assert from "node:assert";
import { emojiToKey, keyToEmoji } from "../dist/index.js";

assert('emojiPileOfPoo' === emojiToKey('💩'));
assert('💩' === keyToEmoji('emojiPileOfPoo'));

assert('emojiServiceDog' === emojiToKey('🐕‍🦺'));
assert('🐕‍🦺' === keyToEmoji('emojiServiceDog'));

assert(null === emojiToKey('no emoji'));

console.log('\nOK\n');
