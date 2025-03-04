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
    expect(() => {
      marked.use(markedEmoji());
    }).toThrow('Must provide emojis to markedEmoji');
  });

  test('null emojis', () => {
    marked.use(markedEmoji({
      emojis: { test: null },
    }));
    expect(marked('this is an :test:')).toBe('<p>this is an :test:</p>\n');
  });

  test('no emojis', () => {
    marked.use(markedEmoji({
      emojis: unicodeEmojis,
    }));
    expect(marked('this is an :invalidemoji:')).toBe('<p>this is an :invalidemoji:</p>\n');
  });

  test('octokit emojis', () => {
    marked.use(markedEmoji({
      emojis: octokitEmojis,
    }));
    expect(marked('I :heart: marked! :tada:')).toBe('<p>I <img alt="heart" src="https://github.githubassets.com/images/icons/emoji/unicode/2764.png?v8" class="marked-emoji-img"> marked! <img alt="tada" src="https://github.githubassets.com/images/icons/emoji/unicode/1f389.png?v8" class="marked-emoji-img"></p>\n');
  });

  test('gfm autolink works', () => {
    marked.use(markedEmoji({
      emojis: unicodeEmojis,
    }));
    marked.use({ gfm: true });
    expect(marked('autolink https://github.com/UziTech/marked-emoji/')).toBe('<p>autolink <a href="https://github.com/UziTech/marked-emoji/">https://github.com/UziTech/marked-emoji/</a></p>\n');
  });

  test('gfm 2 autolinks works', () => {
    marked.use(markedEmoji({
      emojis: unicodeEmojis,
    }));
    marked.use({ gfm: true });
    expect(marked('autolink https://github.com/UziTech/marked-emoji/ https://github.com/UziTech/marked-emoji/')).toBe('<p>autolink <a href="https://github.com/UziTech/marked-emoji/">https://github.com/UziTech/marked-emoji/</a> <a href="https://github.com/UziTech/marked-emoji/">https://github.com/UziTech/marked-emoji/</a></p>\n');
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
    expect(marked(':heart: :heartUrl: :heartUnicode:')).toBe('<p>❤️ <img alt="heartUrl" src="https://example.com/heart.png" class="marked-emoji-img"> 💖</p>\n');
  });

  test('renderer option', () => {
    marked.use(markedEmoji({
      emojis: unicodeEmojis,
      renderer: (token) => token.emoji,
    }));
    expect(marked('I :heart: marked! :tada:')).toBe('<p>I ❤️ marked! 🎉</p>\n');
  });

  test('image renderer', () => {
    marked.use(markedEmoji({
      emojis: octokitEmojis,
      renderer: (token) => `<img alt="${token.name}" src="${token.emoji}" class="img-class">`,
    }));
    expect(marked('I :heart: marked! :tada:')).toBe('<p>I <img alt="heart" src="https://github.githubassets.com/images/icons/emoji/unicode/2764.png?v8" class="img-class"> marked! <img alt="tada" src="https://github.githubassets.com/images/icons/emoji/unicode/1f389.png?v8" class="img-class"></p>\n');
  });

  test('font-awesome renderer', () => {
    marked.use(markedEmoji({
      emojis: {
        heart: 'fa-heart',
        tada: 'fa-tada',
      },
      renderer: (token) => `<i class="fa-solid ${token.emoji}"></i>`,
    }));
    expect(marked('I :heart: marked! :tada:')).toBe('<p>I <i class="fa-solid fa-heart"></i> marked! <i class="fa-solid fa-tada"></i></p>\n');
  });
});
