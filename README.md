# Naive Definitions

_Inspired by [Fuzzy Definitions](https://github.com/jrieken/fuzzy-definitions) and [Find All References](https://github.com/gayanhewa/vscode-find-all-references)_

A Visual Studio Code extension that provides "Go to Definition" and "Find All References" functionality for various programming languages, using a fast textual search.

This extension is helpful when navigating large codebases, especially for weakly-typed languages or languages without good Language Server Protocol (LSP) support, where the built-in IntelliSense engine may fail to provide reliable definitions.

## Features

- Supports "Go to Definition" and "Find All References" for multiple programming languages
- Configurable language-specific search patterns and file globs
- Respects `.gitignore` and other ignore files
- Blazing fast search using [ripgrep](https://github.com/BurntSushi/ripgrep)

## Requirements

- Install [ripgrep](https://github.com/BurntSushi/ripgrep) and make it available in your system's `$PATH` (run `rg` in the command line to verify)

## Extension Settings

This extension contributes the following settings:

- `naiveDefinitions.languageConfigs`: An array of language-specific configurations, each with the following properties:
  - `languages`: An array of programming language IDs to enable the extension for.
  - `definitionPatterns`: An array of regular expression patterns to use when searching for definitions. Use `%s` to represent the word at the cursor position. **Note: These patterns may require escaping special characters depending on your programming language.**
  - `referencePatterns`: An array of regular expression patterns to use when searching for references. Use `%s` to represent the word at the cursor position. **Note: These patterns may require escaping special characters depending on your programming language.**
  - `fileGlobs`: An array of file glob patterns to search within.

Example configuration:

```json
{
  "naiveDefinitions.languageConfigs": [
    {
      "languages": [
        "javascript",
        "javascriptreact",
        "typescript",
        "typescriptreact",
        "vue"
      ],
      "definitionPatterns": [
        "(var|let|const)[^=]+\\b%s\\b",
        "\\b%s\\b\\s=[^=]+"
      ],
      "referencePatterns": ["\\b%s\\b"],
      "fileGlobs": ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx", "**/*.vue"]
    },
    {
      "languages": ["python"],
      "definitionPatterns": ["def\\s+%s\\s\\", "class\\s+%s\\s*\\("],
      "referencePatterns": ["\\b%s\\b"],
      "fileGlobs": ["**/*.py"]
    }
  ]
}
```

## Release Notes

### 0.1.0 - Added support for configuring language-specific search patterns and file globs

- The extension is now activated on-demand when the user invokes the "Go to Definition" or "Find All References" commands, rather than on startup
- Improved performance by only registering providers for the configured languages

### 0.0.7 - Registered as a "Find All References" provider

### 0.0.6 - Added Windows support

### 0.0.5 - Added support for searching `.vue` files for definitions

### 0.0.2 - Added support for searching `.ts` and `.tsx` files for definitions

### 0.0.1 - Initial release
