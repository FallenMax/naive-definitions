# Naive Definitions

_(Inspired by [Fuzzy Definitions](https://github.com/jrieken/fuzzy-definitions) and [Find All References](https://github.com/gayanhewa/vscode-find-all-references))_

Run (blazing fast) textual search to provide 'Go to Definitions' for JavaScript.

Helpful when navigating large JavaScript codebase (facepalm...).

## Requirement

* Install [ripgrep](https://github.com/BurntSushi/ripgrep) and make it available in `$PATH` (run '`rg`' in commandline to verify)

## How it works

Hooks onto 'Go to Definitions' for JavaScript (and .jsx). If no reliable definitions can be inferred by built-in Intellisense engine, this extension will perform a workspace textual search with [ripgrep](https://github.com/BurntSushi/ripgrep), a blazing fast searching utility, to provide some 'likely-to-be' definitions.

It respects `.gitignore`, and only looks at JavaScript (and .jsx) files.

# Release Notes

### 0.0.1

* it now works
