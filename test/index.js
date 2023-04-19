import assert from "node:assert";
import { emojiToKey, keyToEmoji } from "../dist/index.js";

assert('pileOfPoo' === emojiToKey('💩'));
assert('💩' === keyToEmoji('pileOfPoo'));

assert('serviceDog' === emojiToKey('🐕‍🦺'));
assert('🐕‍🦺' === keyToEmoji('serviceDog'));

assert(null === emojiToKey('no emoji'));

console.log('\nOK\n');
