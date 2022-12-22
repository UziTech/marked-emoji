import { marked } from 'marked';
import { markedEmoji } from '../src/index.js';
import { Octokit } from '@octokit/rest';
import { readFile } from 'fs/promises';

describe('marked-emoji', () => {
  let unicodeEmojis, octokitEmojis;

  beforeAll(async() => {
    unicodeEmojis = JSON.parse(
      await readFile('./spec/fixtures/emojis.json')
    );

    const octokit = new Octokit();
    const res = await octokit.rest.emojis.get();
    octokitEmojis = res.data;
  });

  beforeEach(async() => {
    marked.setOptions(marked.getDefaults());
  });

  test('unicode emojis unicode', () => {
    marked.use(markedEmoji({
      emojis: unicodeEmojis,
      unicode: true
    }));
    expect(marked('I :heart: marked! :tada:')).toBe('<p>I ❤️ marked! 🎉</p>\n');
  });

  test('octokit emojis', () => {
    marked.use(markedEmoji({
      emojis: octokitEmojis
    }));
    expect(marked('I :heart: marked! :tada:')).toBe('<p>I <img alt="heart" src="https://github.githubassets.com/images/icons/emoji/unicode/2764.png?v8"> marked! <img alt="tada" src="https://github.githubassets.com/images/icons/emoji/unicode/1f389.png?v8"></p>\n');
  });

  test('exclude array', () => {
    marked.use(markedEmoji({
      emojis: unicodeEmojis,
      exclude: ['tada'],
      unicode: true
    }));
    expect(marked('I :heart: marked! :tada:')).toBe('<p>I ❤️ marked! :tada:</p>\n');
  });

  test('exclude set', () => {
    marked.use(markedEmoji({
      emojis: unicodeEmojis,
      exclude: new Set(['tada']),
      unicode: true
    }));
    expect(marked('I :heart: marked! :tada:')).toBe('<p>I ❤️ marked! :tada:</p>\n');
  });

  test('unicode emojis unicode', () => {
    marked.use(markedEmoji({
      emojis: unicodeEmojis,
      unicode: true
    }));
    expect(marked('I :heart: marked! :tada:')).toBe('<p>I ❤️ marked! 🎉</p>\n');
  });
});
