export type LanguageConfig = {
  languages: string[]
  /**
   * Patterns for finding definitions.
   *
   * The pattern `%s` will be replaced with the word being defined.
   *
   * @example
   * ```
   * const definitionPatterns = [
   *   `\\b%s\\b`,
   * ]
   * ```
   */
  definitionPatterns: string[]
  /**
   * Patterns for finding references.
   *
   * The pattern `%s` will be replaced with the word being referenced.
   */
  referencePatterns: string[]
  /**
   * File globs for finding definitions.
   *
   * @example
   * ```
   * const fileGlobs = [
   *   '**\/*.xsd',
   * ]
   * ```
   */
  fileGlobs: string[]
}

export type LanguageConfigs = LanguageConfig[]
