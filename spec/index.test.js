import { marked } from 'marked';
import { markedEmoji } from '../src/index.js';
import { Octokit } from '@octokit/rest';
import { readFile } from 'node:fs/promises';

const unicodeEmojis = JSON.parse(
  await readFile(new URL('./fixtures/emojis.json', import.meta.url))
);

const octokit = new Octokit();
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
    marked.use(markedEmoji({
      emojis: unicodeEmojis,
      unicode: true
    }));
    expect(marked('I :heart: marked! :tada:')).toBe('<p>I ❤️ marked! 🎉</p>\n');
  });

  test('no emojis', () => {
    marked.use(markedEmoji({
      emojis: unicodeEmojis,
      unicode: true
    }));
    expect(marked('this is an :invalidemoji:')).toBe('<p>this is an :invalidemoji:</p>\n');
  });

  test('octokit emojis', () => {
    marked.use(markedEmoji({
      emojis: octokitEmojis
    }));
    expect(marked('I :heart: marked! :tada:')).toBe('<p>I <img alt="heart" src="https://github.githubassets.com/images/icons/emoji/unicode/2764.png?v8"> marked! <img alt="tada" src="https://github.githubassets.com/images/icons/emoji/unicode/1f389.png?v8"></p>\n');
  });

  test('octokit emojis with xhtml option', () => {
    marked.use(markedEmoji({
      emojis: octokitEmojis
    }));
    marked.use({ xhtml: true });
    expect(marked('I :heart: marked! :tada:')).toBe('<p>I <img alt="heart" src="https://github.githubassets.com/images/icons/emoji/unicode/2764.png?v8" /> marked! <img alt="tada" src="https://github.githubassets.com/images/icons/emoji/unicode/1f389.png?v8" /></p>\n');
  });
});
