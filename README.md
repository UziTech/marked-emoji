# marked-emoji
Parse `:emoji:` as emoji either unicode characters or images. You have to provide your own emojis. The example uses the list of emojis provided by `@octokit/rest` but you can also just create your own list from any source.

The `emojis` option is required.

# Usage

## Octokit example

```js
import {marked} from "marked";
import {markedEmoji} from "marked-emoji";

// or UMD script
// <script src="https://cdn.jsdelivr.net/npm/marked/lib/marked.umd.js"></script>
// <script src="https://cdn.jsdelivr.net/npm/marked-emoji/lib/index.umd.js"></script>

import {Octokit} from "@octokit/rest";

const octokit = new Octokit();
// Get all the emojis available to use on GitHub.
const res = await octokit.rest.emojis.get();
/*
 * {
 *   ...
 *   "heart": "https://...",
 *   ...
 *   "tada": "https://...",
 *   ...
 * }
 */
const emojis = res.data;

const options = {
	emojis,
	renderer: (token) => `<img alt="${token.name}" src="${token.emoji}" class="marked-emoji-img">`
};

marked.use(markedEmoji(options));

marked.parse("I :heart: marked! :tada:");
// <p>I <img alt="heart" src="https://..." class="marked-emoji-img"> marked! <img alt="tada" src="https://..." class="marked-emoji-img"></p>
// I ❤️ marked! 🎉
```

## Unicode example

```js
const options = {
	emojis: {
		"heart": "❤️",
		"tada": "🎉"
	},
	renderer: (token) => token.emoji
};

marked.use(markedEmoji(options));

marked.parse("I :heart: marked! :tada:");
// <p>I ❤️ marked! 🎉</p>
```

## Font Awesome example

```js
const options = {
	emojis: {
		"heart": "fa-heart",
		"tada": "fa-tada"
	},
	renderer: (token) => `<i class="fa-solid ${token.emoji}"></i>`
};

marked.use(markedEmoji(options));

marked.parse("I :heart: marked! :tada:");
// <p>I <i class="fa-solid fa-heart"></i> marked! <i class="fa-solid fa-tada"></i></p>
// I ❤️ marked! 🎉
```

## `options`

| option | default | description |
|--------|---------|-------------|
| emojis | required | An object with keys as emoji name and values as emoji. The value will be passed directly to the renderer as the `token.emoji` property |
| renderer | Octokit renderer: ``(token) => `<img alt="${token.name}" src="${token.emoji}" class="marked-emoji-img">` `` | A function that takes a token object and renders a string. |

## `token`

| property | type | description |
|----------|------|-------------|
| emoji | any | The emoji value. |
| name | string | The emoji name. |
