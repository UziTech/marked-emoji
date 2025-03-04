import { markedEmoji } from 'marked-emoji';
import { expectError } from 'tsd';

// Mandatory arguments
expectError(markedEmoji());
expectError(markedEmoji({}));
expectError(markedEmoji({ emojis: {}, test: true }));
expectError(markedEmoji({ emojis: [] }));

// No error because keys are always coerced to string
// cf. https://www.typescriptlang.org/docs/handbook/2/keyof-types.html
markedEmoji({ emojis: { 0: '❤️' } });
// This works because TypeScript can't exclude empty object when keys are dynamic
markedEmoji({ emojis: {} });

// Valid arguments
markedEmoji({ emojis: { heart: 'https://example.com/heart.png' } });
markedEmoji({ emojis: { heart: '❤️' }});
markedEmoji({ emojis: { heart: '❤️' }, renderer: (token) => token.emoji as string });
markedEmoji({
	emojis: { heartUrl: { url: 'https://example.com/heart.png' }, heartUnicode: { char: '❤️' } },
	renderer(token) {
		return token.emoji.char ?? `<img alt="${token.name}" src="${token.emoji.url}" class="marked-emoji-img">`
	},
});
// emoji object
markedEmoji({ emojis: { heart: { char: '❤️' } }, renderer() { return ''; } });
// emojis must be string with no renderer
expectError(markedEmoji({ emojis: { heart: { char: '❤️' } }}));
markedEmoji({ emojis: { heart: { url: 'https://example.com/heart.png' } }, renderer() { return ''; } });
markedEmoji({ emojis: { heart: { url: 'https://example.com/heart.png', char: '❤️' } }, renderer() { return ''; } });
markedEmoji({ emojis: { heartUrl: { url: 'https://example.com/heart.png' }, heartUnicode: { char: '❤️' } }, renderer() { return ''; } });
