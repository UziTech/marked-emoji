import {markedEmoji} from 'marked-emoji';
import {expectError} from 'tsd';

// Mandatory arguments
expectError(markedEmoji());
expectError(markedEmoji({}));
expectError(markedEmoji({emojis: {}, test: true}));
expectError(markedEmoji({emojis: []}));

// No error because keys are always coerced to string
// cf. https://www.typescriptlang.org/docs/handbook/2/keyof-types.html
markedEmoji({emojis: {0: '❤️'}});

// Valid arguments
markedEmoji({emojis: {heart: 'https://example.com/heart.png'}});
markedEmoji({emojis: {heart: '❤️'}, unicode: true});
markedEmoji({emojis: {heart: 'https://example.com/heart.png'}, unicode: false});
markedEmoji({emojis: {heart: 'https://example.com/heart.png'}, unicode: undefined});
// This works because TypeScript can't exclude empty object when keys are dynamic
markedEmoji({emojis: {}});
// emoji object
markedEmoji({emojis: {heart: {char: '❤️'}}});
markedEmoji({emojis: {heart: {url: 'https://example.com/heart.png'}}});
expectError(markedEmoji({emojis: {heart: {url: 'https://example.com/heart.png', char: '❤️'}}}));
markedEmoji({emojis: {heartUrl: {url: 'https://example.com/heart.png'}, heartUnicode: {char: '❤️'}}});
