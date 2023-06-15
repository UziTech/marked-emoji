const defaultOptions = {
  // emojis: {}, required
  unicode: false,
  name: 'emoji'
};

export function markedEmoji(options) {
  options = {
    ...defaultOptions,
    ...options
  };

  if (!options.emojis) {
    throw new Error('Must provide emojis to markedEmoji');
  }

  return {
    extensions: [{
      name: options.name,
      level: 'inline',
      start(src) { return src.indexOf(':'); },
      tokenizer(src, tokens) {
        const rule = /^:(.+?):/;
        const match = rule.exec(src);
        if (!match) {
          return;
        }

        const name = match[1];
        const emoji = options.emojis[name];

        if (!emoji) {
          return;
        }

        return {
          type: options.name,
          raw: match[0],
          name,
          emoji
        };
      },
      renderer(token) {
        if (options.unicode) {
          return token.emoji;
        } else {
          return `<img alt="${token.name}" src="${token.emoji}"${this.parser.options.xhtml ? ' /' : ''}>`;
        }
      }
    }]
  };
}
