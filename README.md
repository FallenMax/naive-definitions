# Naive Definitions

Naive Definitions is a VS Code fallback navigation extension with curated default patterns for dynamic and weakly typed codebases such as Python, Ruby, JavaScript, Vue, PHP, Lua, and shell scripts.

When existing language services or other providers cannot find definitions or references, it uses ripgrep to run a fast text-based heuristic search.

It is not a replacement for an LSP. Semantic results stay first; text search only steps in when semantic tooling has no answer.

---

## When To Use It

- Dynamic or weakly typed codebases
  - Python, Ruby, JavaScript, Vue, PHP, Lua, shell scripts, and similar projects can hide symbols behind dynamic exports, runtime registration, framework conventions, or unusual directory layouts.
- Incomplete language service coverage
  - Generated files, templates, mixed-format files, and legacy folders may not be covered by a reliable language server.
- Large codebases where a fallback candidate is better than no navigation
  - When precise semantic navigation returns nothing, configurable regex patterns can still find useful candidates inside a bounded file set.

This extension is not a good fit for:

- Type-accurate refactoring
- Distinguishing overloads, lexical scopes, import aliases, or runtime bindings
- Replacing mature language servers for TypeScript, Python, Go, Rust, and similar ecosystems

---

## How It Works

- You trigger VS Code's built-in Go to Definition or Find References action.
- Naive Definitions decides whether to run text fallback search.
  - By default, it does nothing if another definition/reference provider already returned results.
  - If other providers return no results, it searches with ripgrep.
- Search behavior is driven by language configuration.
  - `definitionPatterns` describe what definition candidates look like.
  - `referencePatterns` describe what reference candidates look like.
  - `fileGlobs` limit the searched files.
- Built-in defaults cover JavaScript, Vue, Python, Ruby, PHP, Lua, and shell scripts.
- ripgrep respects `.gitignore` and other ignore files.

---

## Requirements

Install ripgrep and make sure the VS Code extension host can access it.

```bash
rg --version
```

If `rg` is not available on `$PATH`, configure an explicit executable path:

```json
{
  "naiveDefinitions.rgPath": "/absolute/path/to/rg"
}
```

---

## Configuration

### Fallback Policy

```json
{
  "naiveDefinitions.definitionFallbackMode": "whenNoOtherResults",
  "naiveDefinitions.referenceFallbackMode": "whenNoOtherResults"
}
```

Supported values:

- `whenNoOtherResults`
  - Default.
  - Run Naive Definitions only when other providers return no results.
- `always`
  - Always run text search.
  - Useful when you want textual candidates to be included alongside semantic results.
- `never`
  - Disable text search for that capability.

### ripgrep Path

```json
{
  "naiveDefinitions.rgPath": "rg"
}
```

By default, the extension uses `rg` from `$PATH`.

### Curated Defaults

Naive Definitions ships with conservative default rules for:

- JavaScript / JSX / Vue
  - Variables, functions, async functions, classes, common type-shaped declarations in mixed JS/TS codebases, object keys, methods, modifiers, import aliases, and prototype-style assignments
- Python
  - Functions, async functions, classes, type aliases, assignments, annotated assignments, walrus assignments, import aliases, and `.pyi` stubs
- Ruby
  - Methods, singleton methods, classes, modules, assignments, and `attr_*` declarations
- PHP
  - Functions, classes, interfaces, traits, and variables
- Lua
  - Local/global assignments, functions, table functions, and function-valued fields
- Shell scripts
  - Function declarations, assignments, and `export` / `readonly` / `local` assignments

The defaults are intentionally conservative. They prioritize useful fallback candidates over broad matching.

### Custom Language Search Rules

You can override or extend the default language rules:

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
        "\\b(?:var|let|const)\\s+[^\\n;]*\\b%s\\b",
        "\\bfunction\\s+%s\\s*\\(",
        "\\bclass\\s+%s\\b",
        "^\\s*(?:async\\s+)?%s\\s*\\([^\\)]*\\)\\s*\\{",
        "^\\s*%s\\s*:",
        "\\.%s\\s*="
      ],
      "referencePatterns": [
        "\\b%s\\b"
      ],
      "fileGlobs": [
        "**/*.js",
        "**/*.jsx",
        "**/*.ts",
        "**/*.tsx",
        "**/*.vue"
      ]
    }
  ]
}
```

Rule semantics:

- `languages`
  - VS Code language IDs that should use this rule set.
- `definitionPatterns`
  - ripgrep regex patterns used to find definition candidates.
  - `%s` is replaced with the symbol text at the cursor.
- `referencePatterns`
  - ripgrep regex patterns used to find reference candidates.
- `fileGlobs`
  - Glob patterns that bound the ripgrep search scope.

---

## Limitations

- Results are heuristic.
  - Regex cannot understand scopes, types, module systems, or runtime bindings.
- Reference search can be broad.
  - A simple `\\b%s\\b` pattern finds matching text, not necessarily the same symbol.
- Definition quality depends on pattern quality.
  - Dynamic registration, macros, decorators, and framework conventions may require project-specific rules.
- Search depends on ripgrep.
  - VS Code does not currently expose a stable extension API for reusing its built-in full-text search implementation.

---

## Development

```bash
pnpm install
pnpm test
pnpm run check-types
pnpm run build
pnpm run package
```

Common scripts:

- `pnpm test`
  - Run search tests.
- `pnpm run check-types`
  - Run TypeScript type checking.
- `pnpm run build`
  - Build the production extension bundle.
- `pnpm run package`
  - Package a VSIX file.
