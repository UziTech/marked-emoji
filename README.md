# marked-emoji
Parse `:emoji:` as emoji either unicode characters or images. You have to provide your own emojis. The example uses the list of emojis provided by `@octokit/rest` but you can also just create your own list from any source.

The `emojis` option is required.

# Usage

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
	unicode: false,
};

marked.use(markedEmoji(options));

marked.parse("I :heart: marked! :tada:");
// <p>I ❤️ marked! 🎉</p>
```

## `options`

| option | default | description |
|--------|---------|-------------|
| emojis | required | An object with keys as emoji name and values as emoji. The values are assumed to be image urls (as returned by Octokit) unless `unicode` option is `true`. Values can also be an object with a `url` property or `char` property to allow unicode and url emoji at the same time. |
| unicode | `false` | Whether `emojis` values are image urls (`false`) or unicode characters (`true`). If set to `true`, an `<img>` element with class `marked-emoji-img` will be generated. |

