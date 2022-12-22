const defaultOptions = {
  // emojis: {}, required
  exclude: null,
  unicode: false
};

export function markedEmoji(options) {
  if (!options.emojis) {
    throw new Error('Must provide emojis to markedEmoji');
  }
  options = {
    ...defaultOptions,
    ...options
  };

  return {
    extensions: [{
      name: 'emoji',
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

        if (options.exclude) {
          if (Array.isArray(options.exclude)) {
            if (options.exclude.includes(name)) {
              return;
            }
          } else if (options.exclude instanceof Set) {
            if (options.exclude.has(name)) {
              return;
            }
          }
        }

        return {
          type: 'emoji',
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
