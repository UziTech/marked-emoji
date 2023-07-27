import { marked } from 'marked';
import { markedEmoji } from '../src/index.js';
import { Octokit } from '@octokit/rest';
import { throttling } from '@octokit/plugin-throttling';
import { readFile } from 'node:fs/promises';

const unicodeEmojis = JSON.parse(
  await readFile(new URL('./fixtures/emojis.json', import.meta.url))
);

const MyOctokit = Octokit.plugin(throttling);
const octokit = new MyOctokit({
  throttle: {
    onRateLimit: (retryAfter, options) => {
      octokit.log.warn(
        `Request quota exhausted for request ${options.method} ${options.url}`
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
        `Secondary quota detected for request ${options.method} ${options.url}`
      );
    }
  }
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

  test('unicode emojis unicode', () => {
    marked.use(
      markedEmoji({
        emojis: unicodeEmojis,
        unicode: true
      })
    );
    expect(marked('I :heart: marked! :tada:')).toBe('<p>I ❤️ marked! 🎉</p>\n');
  });

  test('no emojis', () => {
    marked.use(
      markedEmoji({
        emojis: unicodeEmojis,
        unicode: true
      })
    );
    expect(marked('this is an :invalidemoji:')).toBe(
      '<p>this is an :invalidemoji:</p>\n'
    );
  });

  test('octokit emojis', () => {
    marked.use(
      markedEmoji({
        emojis: octokitEmojis
      })
    );
    expect(marked('I :heart: marked! :tada:')).toBe(
      '<p>I <img alt="heart" class="marked-emoji" src="https://github.githubassets.com/images/icons/emoji/unicode/2764.png?v8"> marked! <img alt="tada" class="marked-emoji" src="https://github.githubassets.com/images/icons/emoji/unicode/1f389.png?v8"></p>\n'
    );
  });

  test('octokit emojis with xhtml option', () => {
    marked.use(
      markedEmoji({
        emojis: octokitEmojis
      })
    );
    marked.use({ xhtml: true });
    expect(marked('I :heart: marked! :tada:')).toBe(
      '<p>I <img alt="heart" class="marked-emoji" src="https://github.githubassets.com/images/icons/emoji/unicode/2764.png?v8" /> marked! <img alt="tada" class="marked-emoji" src="https://github.githubassets.com/images/icons/emoji/unicode/1f389.png?v8" /></p>\n'
    );
  });

  test('gfm autolink works', () => {
    marked.use(
      markedEmoji({
        emojis: unicodeEmojis,
        unicode: true
      })
    );
    marked.use({ gfm: true });
    expect(marked('autolink https://github.com/UziTech/marked-emoji/')).toBe(
      '<p>autolink <a href="https://github.com/UziTech/marked-emoji/">https://github.com/UziTech/marked-emoji/</a></p>\n'
    );
  });

  test('gfm 2 autolinks works', () => {
    marked.use(
      markedEmoji({
        emojis: unicodeEmojis,
        unicode: true
      })
    );
    marked.use({ gfm: true });
    expect(
      marked(
        'autolink https://github.com/UziTech/marked-emoji/ https://github.com/UziTech/marked-emoji/'
      )
    ).toBe(
      '<p>autolink <a href="https://github.com/UziTech/marked-emoji/">https://github.com/UziTech/marked-emoji/</a> <a href="https://github.com/UziTech/marked-emoji/">https://github.com/UziTech/marked-emoji/</a></p>\n'
    );
  });

  test('unicode and url emojis', () => {
    marked.use(
      markedEmoji({
        emojis: {
          heart: '❤️',
          heartUrl: { url: 'https://example.com/heart.png' },
          heartUnicode: { char: '💖' }
        },
        unicode: true
      })
    );
    marked.use({ gfm: true });
    expect(marked(':heart: :heartUrl: :heartUnicode:')).toBe(
      '<p>❤️ <img alt="heartUrl" class="marked-emoji" src="https://example.com/heart.png"> 💖</p>\n'
    );
  });

  test('invalid emoji object', () => {
    marked.use(
      markedEmoji({
        emojis: { test: { nothing: '' } }
      })
    );
    marked.use({ gfm: true });
    expect(marked(':test:')).toBe('<p>:test:</p>\n');
  });
});
