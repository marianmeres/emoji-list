const fs = require('node:fs');
const path = require('node:path');
const { mkdirpSync } = require('mkdirp');
const { rimrafSync } = require('rimraf');
const { yellow, red, cyan, gray } = require('kleur/colors');
const args = require('minimist')(process.argv.slice(2));

const COMMAND = args._[0];
const INFILE = './src/emoji-list-v15.0.tsv';
const OUTDIR = 'dist';

// return early with help?
const isHelp = !!args.h || !!args.help || !COMMAND;
if (isHelp) return help();

//
const isSilent = args.silent;
const log = (...args) => {
	if (isSilent) return;
	console.log.apply(null, args);
};

// run now
main().catch(onError);

//////////////////////////////////////////////////////////////////////////////////////////
async function main() {
	switch (COMMAND.toLowerCase()) {
		case 'help':
			return help();
		case 'build':
			return await build();
		default:
			throw new Error(`Command "${COMMAND}" not found`);
	}
}

//////////////////////////////////////////////////////////////////////////////////////////
async function build() {
	const rows = fs
		.readFileSync(INFILE, 'utf8')
		.trim()
		.split('\n')
		.map((v) => v.trim())
		.filter(Boolean)
		.map((v) => v.split('\t'));

	let keyMap = {};
	let codeMap = {};
	let keyToGroupMap = {};
	let groupToKeyMap = {};
	let fulltextMap = {};
	let groupMajor;
	let groupMinor;
	for (let i = 0; i < rows.length; i++) {
		const row = rows[i];
		const next = rows[i + 1];
		const [id, hexs, , name] = row;

		if (row.length === 1) {
			if (next && next.length === 1) {
				groupMajor = outGroup(id);
				groupMinor = outGroup(next[0]);
				i++;
			} else {
				groupMinor = outGroup(id);
			}
			continue;
		}
		if (name) {
			const key = outKey(name);
			const hex = outHex(hexs);

			if (keyMap[key]) {
				console.log(red(`WARN: Key ${key} already exists!`));
			} else {
				keyMap[key] = hex;
			}

			if (codeMap[hex]) {
				console.log(red(`WARN: Hex ${hex} already exists!`));
			} else {
				codeMap[hex] = key;
			}

			keyToGroupMap[key] = [groupMajor, groupMinor];
			groupToKeyMap[groupMajor] ||= [];
			groupToKeyMap[groupMajor].push(key);
			groupToKeyMap[`${groupMajor}/${groupMinor}`] ||= [];
			groupToKeyMap[`${groupMajor}/${groupMinor}`].push(key);

			fulltextMap[key] = name;
		}
	}

	rimrafSync(OUTDIR);
	mkdirpSync(OUTDIR);

	//
	fs.writeFileSync(
		path.join(OUTDIR, 'key-map.js'),
		`export const emojiKeyMap = ${JSON.stringify(keyMap, null, ' ')};\n`
	);
	fs.writeFileSync(
		path.join(OUTDIR, 'key-map.d.ts'),
		`export declare const emojiKeyMap: Record<string, string>;\n`
	);

	//
	fs.writeFileSync(
		path.join(OUTDIR, 'code-map.js'),
		`export const emojiCodeMap = ${JSON.stringify(codeMap, null, ' ')};\n`
	);
	fs.writeFileSync(
		path.join(OUTDIR, 'key-map.d.ts'),
		`export declare const emojiCodeMap: Record<string, string>;\n`
	);

	//
	fs.writeFileSync(
		path.join(OUTDIR, 'groups.js'),
		`export const emojiKeyToGroupMap = ${JSON.stringify(keyToGroupMap, null, ' ')};
export const emojiGroupToKeyMap = ${JSON.stringify(groupToKeyMap, null, ' ')};\n`
	);
	fs.writeFileSync(
		path.join(OUTDIR, 'groups.d.ts'),
		`export declare const emojiKeyToGroupMap: Record<string, string[]>;
export declare const emojiGroupToKeyMap: Record<string, string[]>;\n`
	);

	//
	fs.writeFileSync(
		path.join(OUTDIR, 'fulltext.js'),
		`export const emojiFulltextMap = ${JSON.stringify(fulltextMap, null, ' ')};\n`
	);
	fs.writeFileSync(
		path.join(OUTDIR, 'fulltext.d.ts'),
		`export declare const emojiFulltextMap: Record<string, string>;\n`
	);

	const index = `
export { emojiKeyMap } from './key-map.js';
export { emojiCodeMap } from './code-map.js';
export { emojiKeyToGroupMap, emojiGroupToKeyMap } from './groups.js';
export { emojiFulltextMap } from './fulltext.js';
`;
	fs.writeFileSync(path.join(OUTDIR, 'index.js'), index);
	fs.writeFileSync(path.join(OUTDIR, 'index.d.ts'), index);

	// index.d.ts

	log(gray(`OK\n`));
}

function help() {
	const self = path.basename(__filename);
	console.log(`
    This script will create emoji list json.

    ${yellow('Usage:')}
        node ${self} build

`);
	process.exit();
}

function onError(e) {
	console.log('\n' + red(e.toString().trim()) + '\n');
	process.exit(1);
}

function ucfirst(str) {
	return `${str}`.charAt(0).toUpperCase() + `${str}`.slice(1);
}

function outHex(s) {
	return `${s}`
		.toLowerCase()
		.split(' ')
		.filter(Boolean)
		.map((v) => v.replace('u+', ''))
		.join('-');
}

function outGroup(name) {
	return replaceMap(unaccent(name), { '&': 'and' }).toLowerCase().trim();
}

function outKey(name) {
	return (
		'emoji' +
		replaceMap(unaccent(name), {
			'#': 'hash',
			'*': 'star',
			'&': 'and',
			'’': '',
			"'": '',
		})
			.replace(/\W/g, ' ')
			.replace(/\s+/g, ' ')
			.split(' ')
			.map(ucfirst)
			.join('')
	);
}

function replaceMap(str, map, ignoreCase = false) {
	// normalize map to lower case keys if case insensitive
	// prettier-ignore
	if (ignoreCase) {
		map = Object.entries(map).reduce(
			(memo, [k, v]) => ({ ...memo, [k.toLowerCase()]: v }), {}
		);
	}

	let patterns = [];
	Object.keys(map).forEach((k) => patterns.push(escapeRegex(k)));
	let regExp = new RegExp(patterns.join('|'), 'g' + (ignoreCase ? 'i' : ''));
	return str.replace(regExp, (match) => {
		if (ignoreCase) {
			match = match.toLowerCase();
		}
		let replaced = typeof map[match] === 'function' ? map[match]() : map[match];
		if (replaced === null || replaced === void 0) {
			return '';
		}
		return replaced;
	});
}

function escapeRegex(str) {
	return (str + '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function unaccent(str) {
	return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
