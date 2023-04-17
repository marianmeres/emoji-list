
export { emojiKeyMap } from './key-map.js';
export { emojiCodeMap } from './code-map.js';
export { emojiKeyToGroupMap, emojiGroupToKeyMap } from './groups.js';
export { emojiFulltextMap } from './fulltext.js';

import { emojiCodeMap } from './code-map.js';
export const emojiToKey = (emoji) => {
	const id = [...emoji].map((char) => (char.codePointAt(0) || '').toString(16)).join('-');
	return emojiCodeMap[id] || null;
}

import { emojiKeyMap } from './key-map.js';
export const keyToEmoji = (key) => `${emojiKeyMap[key] || ''}`.split('-').reduce((m, v) => m += String.fromCodePoint(parseInt(v, 16)), '');
