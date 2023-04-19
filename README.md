# @marianmeres/emoji-list

List of emojis (data from https://unicode.org/emoji/charts/full-emoji-list.html)
compiled into javascript plain object maps. Useful as low level helpers for various 
emoji processing tools.

NOTE: only default skin-tone

## key to hex
```javascript
import { emojiKeyMap } from './@marianmers/emoji-list';

// emojiKeyMap contains full key-to-hex map of all emojis
{
    "grinningFace": "1f600",
    // ... ~1870 records omitted here
    "flagWales": "1f3f4-e0067-e0062-e0077-e006c-e0073-e007f"
}
```

## hex to key
```javascript
import { emojiCodeMap } from './@marianmers/emoji-list';

// emojiCodeMap contains full hex-to-key map of all emojis
{
    "1f600": "grinningFace",
    // ... ~1870 records omitted here
    "1f3f4-e0067-e0062-e0077-e006c-e0073-e007f": "flagWales"
}
```

## groups map (both major and minor)
```javascript
import { emojiKeyToGroupMap, emojiGroupToKeyMap } from './@marianmers/emoji-list';

// emojiKeyToGroupMap contains full key-to-groups [major, minor] map
{
    "grinningFace": [ "smileys and emotion", "face-smiling" ],
    // ... ~1870 records omitted here
    "flagWales": [ "flags", "subdivision-flag" ]
}

// emojiGroupToKeyMap contains full group-to-key map
{
    // major group
    "smileys and emotion": [ "grinningFace", /*...*/ ],
    // ...
	
    // major/minor group
    "smileys and emotion/face-smiling": [ "grinningFace", /*...*/ ],
    // ...
}
```

## text description
```javascript
import { emojiFulltextMap } from './@marianmers/emoji-list';

// emojifulltextMap contains full key-to-text map of all emojis
{
    "grinningFace": "grinning face",
    // ... ~1870 records omitted here
    "flagWales": "flag: Wales"
}
```

## `emojiToKey` and `keyToEmoji` helpers
```javascript
import { emojiToKey, keyToEmoji } from './@marianmers/emoji-list';

assert('pileOfPoo' === emojiToKey('💩'));
assert('💩' === keyToEmoji('pileOfPoo'));
```
