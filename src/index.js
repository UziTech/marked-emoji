const defaultOptions = {
  // emojis: {}, required
  unicode: false
};

export function markedEmoji(options) {
  options = {
    ...defaultOptions,
    ...options
  };

  if (!options.emojis) {
    throw new Error('Must provide emojis to markedEmoji');
  }

  const emojiNames = Object.keys(options.emojis).map(e => e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const emojiRegex = new RegExp(`:(${emojiNames}):`);
  const tokenizerRule = new RegExp(`^${emojiRegex.source}`);

  return {
    extensions: [{
      name: 'emoji',
      level: 'inline',
      start(src) { return src.match(emojiRegex)?.index; },
      tokenizer(src, tokens) {
        const match = tokenizerRule.exec(src);
        if (!match) {
          return;
        }

        const name = match[1];
        let emoji = options.emojis[name];
        let unicode = options.unicode;

        if (typeof emoji !== 'string') {
          if (typeof emoji.char === 'string') {
            emoji = emoji.char;
            unicode = true;
          } else if (typeof emoji.url === 'string') {
            emoji = emoji.url;
            unicode = false;
          } else {
            // invalid emoji
            return;
          }
        }

        return {
          type: 'emoji',
          raw: match[0],
          name,
          emoji,
          unicode
        };
      },
      renderer(token) {
        if (token.unicode) {
          return token.emoji;
        } else {
          return `<img alt="${token.name}" src="${token.emoji}" class="marked-emoji-img">`;
        }
      }
    }]
  };
}
