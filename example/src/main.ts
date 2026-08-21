/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="esnext" />
/**
 * Example app for `@marianmeres/emoji-list`.
 *
 * A live emoji explorer: substring search via `searchEmoji`, group browsing via
 * `emojiGroupToKeyMap`, and a detail card showing what the helpers return for
 * the picked emoji (`keyToEmoji`, `emojiToHex`, `emojiKeyToGroupMap`, …).
 *
 * Built with `@marianmeres/vanilla`: explicit reactive state (`observable` /
 * `computed`), markup that lives in `<template>`s (`fromTemplate` / `refs`), and
 * a single delegated listener tree (`delegate`). All wiring is torn down by the
 * view's `track()`-based lifecycle.
 *
 * This is browser code: the triple-slash lib references above type it against the
 * DOM (the repo's `deno.json` targets the Deno runtime for the library itself).
 *
 * Bundle with: `deno task example:build` (→ `example/dist/bundle.js`).
 */
import {
	computed,
	createView,
	delegate,
	fromTemplate,
	observable,
	refs,
} from "@marianmeres/vanilla";
import {
	EMOJI_DATA_VERSION,
	emojiFulltextMap,
	emojiGroupToKeyMap,
	emojiKeyMap,
	emojiKeyToGroupMap,
	emojiToHex,
	keyToEmoji,
	searchEmoji,
} from "../../src/mod.ts";
import { VERSION } from "./version.generated.ts";

/* ---- Config --------------------------------------------------------------- */

/** What the grid renders — `EmojiSearchResult` is a structural superset. */
interface Item {
	key: string;
	emoji: string;
	name: string;
}

/** Must match the literal in the anti-FOUC inline script in index.html. */
const THEME_KEY = "emoji-list-example-theme";

/** Preselected on load so the detail card demonstrates itself immediately. */
const INITIAL_KEY = "pileOfPoo";

/* ---- State (module-level: outlives any view) ------------------------------ */

const query = observable("");
const group = observable(""); // "" = all groups
const selectedKey = observable<string | null>(INITIAL_KEY);

/** Top-level group names ("group") — the map also has "group/subgroup" keys. */
const TOP_GROUPS = Object.keys(emojiGroupToKeyMap).filter((g) => !g.includes("/"));
const TOTAL = Object.keys(emojiKeyMap).length;

const fromKeys = (keys: string[]): Item[] =>
	keys.map((key) => ({
		key,
		emoji: keyToEmoji(key),
		name: emojiFulltextMap[key] ?? key,
	}));

// What the grid shows. A non-empty query searches (optionally narrowed to the
// selected group); an empty query lists the selected group, or everything.
const items = computed([query, group], (): Item[] => {
	const q = query.get().trim();
	const g = group.get();
	if (q) {
		const results = searchEmoji(q);
		return g ? results.filter((r) => r.group === g) : results;
	}
	return fromKeys(g ? emojiGroupToKeyMap[g] ?? [] : Object.keys(emojiKeyMap));
});

/* ---- Theme (page-level, class-based: matches the design-tokens `.dark`) ----
 * The class is set pre-paint by the inline script in index.html; this keeps it
 * and the browser chrome color (<meta name="theme-color">) in sync afterwards. */

const prefersDark = (): boolean =>
	globalThis.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;

const applyTheme = (dark: boolean): void => {
	const root = document.documentElement;
	root.classList.toggle("dark", dark);
	const bg = getComputedStyle(root)
		.getPropertyValue("--stuic-color-background")
		.trim();
	if (bg) {
		document
			.querySelector('meta[name="theme-color"]')
			?.setAttribute("content", bg);
	}
};

let isDark = (() => {
	const stored = localStorage.getItem(THEME_KEY);
	return stored ? stored === "dark" : prefersDark();
})();
applyTheme(isDark);

const toggleTheme = (): void => {
	isDark = !isDark;
	applyTheme(isDark);
	localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
};

/* ---- Utils ---------------------------------------------------------------- */

function debounce<A extends unknown[]>(
	fn: (...args: A) => void,
	wait: number,
): (...args: A) => void {
	let t: ReturnType<typeof setTimeout> | undefined;
	return (...args: A) => {
		if (t) clearTimeout(t);
		t = setTimeout(() => fn(...args), wait);
	};
}

const nf = new Intl.NumberFormat();
const fmt = (n: number): string => nf.format(n);

/** Keystrokes feed the reactive query through a short debounce. */
const setQuery = debounce((v: string) => query.set(v), 120);

/* ---- View ----------------------------------------------------------------- */

const app = createView((track) => {
	const el = fromTemplate("tpl-app");
	const r = refs(el);
	const copyBtn = r.copy as HTMLButtonElement;

	// Populate the group <select> straight from the data map.
	{
		const select = r.group as HTMLSelectElement;
		const all = document.createElement("option");
		all.value = "";
		all.textContent = `All groups (${fmt(TOTAL)})`;
		select.appendChild(all);
		for (const g of TOP_GROUPS) {
			const opt = document.createElement("option");
			opt.value = g;
			opt.textContent = `${g} (${fmt(emojiGroupToKeyMap[g].length)})`;
			select.appendChild(opt);
		}
	}

	const renderGrid = (list: Item[]): void => {
		const selected = selectedKey.get();
		const frag = document.createDocumentFragment();
		for (const it of list) {
			const btn = document.createElement("button");
			btn.type = "button";
			btn.className = it.key === selected ? "cell selected" : "cell";
			btn.textContent = it.emoji;
			btn.title = `${it.name} (${it.key})`;
			btn.setAttribute("aria-label", it.name);
			btn.dataset.key = it.key;
			btn.dataset.on = "click:pick";
			frag.appendChild(btn);
		}
		r.grid.replaceChildren(frag);
		r.scroll.scrollTop = 0; // a new query starts at the top of the grid
	};

	const renderStatus = (list: Item[]): void => {
		const q = query.get().trim();
		const g = group.get();
		const inGroup = g ? ` in “${g}”` : "";
		if (!q) {
			r.status.textContent = g
				? `${fmt(list.length)} emojis${inGroup}.`
				: `${fmt(TOTAL)} emojis — type to search, or pick a group.`;
		} else {
			const n = list.length;
			r.status.textContent = n
				? `${fmt(n)} ${n === 1 ? "match" : "matches"}${inGroup}.`
				: `No matches${inGroup}.`;
		}
		r.empty.hidden = list.length > 0 || !q;
	};

	// Drive the grid + status line off the reactive item list.
	track(items.subscribe((list) => {
		renderGrid(list);
		renderStatus(list);
	}));

	// The detail card: everything the package knows about the picked emoji.
	track(selectedKey.subscribe((key) => {
		r.grid.querySelector(".cell.selected")?.classList.remove("selected");
		r.detail.hidden = !key;
		if (!key) return;
		const emoji = keyToEmoji(key);
		const [grp, sub] = emojiKeyToGroupMap[key] ?? ["", ""];
		r.dEmoji.textContent = emoji;
		r.dName.textContent = emojiFulltextMap[key] ?? key;
		r.dMeta.textContent = [grp, sub].filter(Boolean).join(" · ");
		r.dKey.textContent = key;
		r.dHex.textContent = emojiToHex(emoji);
		r.grid.querySelector(`[data-key="${key}"]`)?.classList.add("selected");
	}));

	// Copy the raw emoji character; flash feedback on the button itself.
	let copyTimer: ReturnType<typeof setTimeout> | undefined;
	const copySelected = async (): Promise<void> => {
		const key = selectedKey.get();
		if (!key) return;
		let label = "Copied ✓";
		try {
			await navigator.clipboard.writeText(keyToEmoji(key));
		} catch {
			label = "Copy failed";
		}
		copyBtn.textContent = label;
		if (copyTimer) clearTimeout(copyTimer);
		copyTimer = setTimeout(() => (copyBtn.textContent = "Copy"), 1200);
	};
	track(() => clearTimeout(copyTimer));

	// One delegated listener tree for the whole view (events bubble to `el`).
	track(delegate(el, {
		setQuery: (_e, t) => setQuery((t as HTMLInputElement).value),
		setGroup: (_e, t) => group.set((t as HTMLSelectElement).value),
		pick: (_e, t) => selectedKey.set((t as HTMLElement).dataset.key ?? null),
		copyEmoji: () => void copySelected(),
		toggleTheme: () => toggleTheme(),
	}));

	r.dataVersion.textContent = EMOJI_DATA_VERSION;
	r.version.textContent = `v${VERSION}`;

	return { el };
});

document.getElementById("app")!.appendChild(app.el!);
