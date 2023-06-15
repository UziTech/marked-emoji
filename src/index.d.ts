declare module 'marked-emoji' {
    /**
     * Options for configuring the marked-emojis extension
     */
    interface MarkedEmojiOptions {
        /**
         * An object with keys as emoji name and values as emoji. The values are
         * assumed to be image urls (as returned by Octokit) unless `unicode` option
         * is `true`.
         */
        emojis: { [ k: string ]: string };
        /**
         * Whether `emojis` values are image urls (`false`) or unicode characters (`true`)
         */
        unicode?: boolean;
    }
    /**
     * Configures a marked extension to parse `:emoji:` as emoji either unicode
     * characters or images.
     *
     * @param options Options of the extension
     * @return A MarkedExtension to be passed to `marked.use()`
     */
    export function markedEmoji(options: MarkedEmojiOptions): import('marked').marked.MarkedExtension;
  }