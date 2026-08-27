const defaultOptions = {
  // emojis: {}, required
  renderer: undefined,
};

function escapeRegExp(string) {
  if (RegExp.escape) {
    // Available in node v24
    return RegExp.escape(string);
  }
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function markedEmoji(options) {
  options = {
    ...defaultOptions,
    ...options,
  };

  if (!options.emojis) {
    throw new Error('Must provide emojis to markedEmoji');
  }

  const emojis = {};
  for (const [name, emoji] of Object.entries(options.emojis)) {
    emojis[name.toLowerCase()] = emoji;
  }

  const emojiNames = Object.keys(emojis).map(e => escapeRegExp(e)).join('|');
  const emojiRegex = new RegExp(`:(${emojiNames}):`, 'i');
  const tokenizerRule = new RegExp(`^${emojiRegex.source}`, 'i');

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
        const emoji = emojis[name.toLowerCase()];

        if (!emoji) {
          return;
        }

        return {
          type: 'emoji',
          raw: match[0],
          name,
          emoji,
        };
      },
      renderer(token) {
        if (options.renderer) {
          return options.renderer(token);
        }

        return `<img alt="${token.name}" src="${token.emoji}" class="marked-emoji-img">`;
      },
    }],
  };
}
