declare module 'marked-emoji' {

  /**
     * Token sent to the renderer
     */
  interface EmojiToken<T> {
    type: 'emoji';
    raw: string;
    name: string;
    emoji: T;
  }

    /**
     * Options for configuring the marked-emojis extension
     */
    type MarkedEmojiOptions<T> = {
      /**
       * An object with keys as emoji name and values are assumed to be image urls (as returned by Octokit).
       */
      emojis: Record<string, string>
    } | {
      /**
       * An object with keys as emoji name and values are passed to the renderer as is.
       */
      emojis: Record<string, T>;

      /**
       * Renderer function to render emoji
       */
      renderer(token: EmojiToken<T>): string;
    };

    /**
     * Configures a marked extension to parse `:emoji:` as images or any registered.
     *
     * @param options Options of the extension
     * @return A MarkedExtension to be passed to `marked.use()`
     */
    export function markedEmoji<T>(options: MarkedEmojiOptions<T>): import('marked').MarkedExtension;
}
