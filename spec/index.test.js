import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { marked } from 'marked';
import { markedEmoji } from '../src/index.js';
import { Octokit } from '@octokit/rest';
import { throttling } from '@octokit/plugin-throttling';
import { readFile } from 'node:fs/promises';

const unicodeEmojis = JSON.parse(
  await readFile(new URL('./fixtures/emojis.json', import.meta.url)),
);

const MyOctokit = Octokit.plugin(throttling);
const octokit = new MyOctokit({
  throttle: {
    onRateLimit: (retryAfter, options) => {
      octokit.log.warn(
        `Request quota exhausted for request ${options.method} ${options.url}`,
      );

      // Retry five times after hitting a rate limit error, then give up
      if (options.request.retryCount <= 5) {
        console.log(`Retrying after ${retryAfter} seconds!`);
        return true;
      }
    },
    onSecondaryRateLimit: (retryAfter, options, octokit) => {
      // does not retry, only logs a warning
      octokit.log.warn(
        `Secondary quota detected for request ${options.method} ${options.url}`,
      );
    },
  },
});
const res = await octokit.rest.emojis.get();
const octokitEmojis = res.data;

describe('marked-emoji', () => {
  beforeEach(async() => {
    marked.setOptions(marked.getDefaults());
  });

  test('invalid emojis option', () => {
    assert.throws(() => {
      marked.use(markedEmoji());
    }, { message: 'Must provide emojis to markedEmoji' });
  });

  test('null emojis', () => {
    marked.use(markedEmoji({
      emojis: {
        undefined,
        null: null,
      },
    }));
    assert.strictEqual(marked('this is an :undefined: and :null: emoji'), '<p>this is an :undefined: and :null: emoji</p>\n');
  });

  test('no emojis', () => {
    marked.use(markedEmoji({
      emojis: unicodeEmojis,
    }));
    assert.strictEqual(marked('this is an :invalidemoji:'), '<p>this is an :invalidemoji:</p>\n');
  });

  test('octokit emojis', () => {
    marked.use(markedEmoji({
      emojis: octokitEmojis,
    }));
    assert.strictEqual(marked('I :heart: marked! :tada:'), '<p>I <img alt="heart" src="https://github.githubassets.com/images/icons/emoji/unicode/2764.png?v8" class="marked-emoji-img"> marked! <img alt="tada" src="https://github.githubassets.com/images/icons/emoji/unicode/1f389.png?v8" class="marked-emoji-img"></p>\n');
  });

  test('gfm autolink works', () => {
    marked.use(markedEmoji({
      emojis: unicodeEmojis,
    }));
    marked.use({ gfm: true });
    assert.strictEqual(marked('autolink https://github.com/UziTech/marked-emoji/'), '<p>autolink <a href="https://github.com/UziTech/marked-emoji/">https://github.com/UziTech/marked-emoji/</a></p>\n');
  });

  test('gfm 2 autolinks works', () => {
    marked.use(markedEmoji({
      emojis: unicodeEmojis,
    }));
    marked.use({ gfm: true });
    assert.strictEqual(marked('autolink https://github.com/UziTech/marked-emoji/ https://github.com/UziTech/marked-emoji/'), '<p>autolink <a href="https://github.com/UziTech/marked-emoji/">https://github.com/UziTech/marked-emoji/</a> <a href="https://github.com/UziTech/marked-emoji/">https://github.com/UziTech/marked-emoji/</a></p>\n');
  });

  test('emoji passed to renderer', () => {
    marked.use(markedEmoji({
      emojis: {
        heart: '❤️',
        heartUrl: { url: 'https://example.com/heart.png' },
        heartUnicode: { char: '💖' },
      },
      renderer({ name, emoji }) {
        if (typeof emoji === 'string') {
          return emoji;
        }

        if (emoji.char) {
          return emoji.char;
        }

        return `<img alt="${name}" src="${emoji.url}" class="marked-emoji-img">`;
      },
    }));
    marked.use({ gfm: true });
    assert.strictEqual(marked(':heart: :heartUrl: :heartUnicode:'), '<p>❤️ <img alt="heartUrl" src="https://example.com/heart.png" class="marked-emoji-img"> 💖</p>\n');
  });

  test('renderer option', () => {
    marked.use(markedEmoji({
      emojis: unicodeEmojis,
      renderer: (token) => token.emoji,
    }));
    assert.strictEqual(marked('I :heart: marked! :tada:'), '<p>I ❤️ marked! 🎉</p>\n');
  });

  test('image renderer', () => {
    marked.use(markedEmoji({
      emojis: octokitEmojis,
      renderer: (token) => `<img alt="${token.name}" src="${token.emoji}" class="img-class">`,
    }));
    assert.strictEqual(marked('I :heart: marked! :tada:'), '<p>I <img alt="heart" src="https://github.githubassets.com/images/icons/emoji/unicode/2764.png?v8" class="img-class"> marked! <img alt="tada" src="https://github.githubassets.com/images/icons/emoji/unicode/1f389.png?v8" class="img-class"></p>\n');
  });

  test('font-awesome renderer', () => {
    marked.use(markedEmoji({
      emojis: {
        heart: 'fa-heart',
        tada: 'fa-tada',
      },
      renderer: (token) => `<i class="fa-solid ${token.emoji}"></i>`,
    }));
    assert.strictEqual(marked('I :heart: marked! :tada:'), '<p>I <i class="fa-solid fa-heart"></i> marked! <i class="fa-solid fa-tada"></i></p>\n');
  });

  test('case insensitive emoji matching with uppercase option key', () => {
    marked.use(markedEmoji({
      emojis: {
        Emoji: 'e',
      },
      renderer: (token) => token.emoji,
    }));
    assert.strictEqual(marked(':emoji: :Emoji: :EMOJI:'), '<p>e e e</p>\n');
  });

  test('case insensitive emoji matching with lowercase option key', () => {
    marked.use(markedEmoji({
      emojis: {
        heart: '❤️',
      },
      renderer: (token) => token.emoji,
    }));
    assert.strictEqual(marked(':heart: :Heart: :HEART:'), '<p>❤️ ❤️ ❤️</p>\n');
  });

  test('case insensitive octokit emojis in markdown', () => {
    marked.use(markedEmoji({
      emojis: octokitEmojis,
    }));
    assert.strictEqual(marked('I :HEART: marked! :Tada:'), '<p>I <img alt="HEART" src="https://github.githubassets.com/images/icons/emoji/unicode/2764.png?v8" class="marked-emoji-img"> marked! <img alt="Tada" src="https://github.githubassets.com/images/icons/emoji/unicode/1f389.png?v8" class="marked-emoji-img"></p>\n');
  });

  test('escape regex with RegExp.escape', () => {
    const originalEscape = RegExp.escape;
    RegExp.escape = RegExp.escape || ((string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    try {
      marked.use(markedEmoji({
        emojis: {
          'test+emoji': '👍',
        },
      }));
      assert.strictEqual(marked('I :test+emoji: marked!'), '<p>I <img alt="test+emoji" src="👍" class="marked-emoji-img"> marked!</p>\n');
    } finally {
      if (originalEscape) {
        RegExp.escape = originalEscape;
      } else {
        delete RegExp.escape;
      }
    }
  });

  test('escape regex without RegExp.escape', () => {
    const originalEscape = RegExp.escape;
    delete RegExp.escape;
    try {
      marked.use(markedEmoji({
        emojis: {
          'test+emoji': '👍',
        },
      }));
      assert.strictEqual(marked('I :test+emoji: marked!'), '<p>I <img alt="test+emoji" src="👍" class="marked-emoji-img"> marked!</p>\n');
    } finally {
      if (originalEscape) {
        RegExp.escape = originalEscape;
      }
    }
  });
});
