import { SourceMapConsumer } from "./deps.ts";

import { ProcessOptions } from "./postcss.js";

/**
 * Source map information from input CSS.
 * For example, source map after Sass compiler.
 *
 * This class will automatically find source map in input CSS or in file system
 * near input file (according `from` option).
 *
 * ```js
 * const root = parse(css, { from: 'a.sass.css' })
 * root.input.map //=> PreviousMap
 * ```
 */
export default class PreviousMap {
  /**
   * Was source map inlined by data-uri to input CSS.
   */
  inline: boolean;

  /**
   * `sourceMappingURL` content.
   */
  annotation?: string;

  /**
   * Source map file content.
   */
  text?: string;

  /**
   * The directory with source map file, if source map is in separated file.
   */
  root?: string;

  /**
   * The CSS source identifier. Contains `Input#file` if the user
   * set the `from` option, or `Input#id` if they did not.
   */
  file?: string;

  /**
   * Path to source map file.
   */
  mapFile?: string;

  /**
   * @param css  Input CSS source.
   * @param opts Process options.
   */
  constructor(css: string, opts?: ProcessOptions);

  /**
   * Create a instance of `SourceMapGenerator` class
   * from the `source-map` library to work with source map information.
   *
   * It is lazy method, so it will create object only on first call
   * and then it will use cache.
   *
   * @return Object with source map information.
   */
  consumer(): SourceMapConsumer;

  /**
   * Does source map contains `sourcesContent` with input source text.
   *
   * @return Is `sourcesContent` present.
   */
  withContent(): boolean;
}