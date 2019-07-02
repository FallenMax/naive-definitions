# Naive Definitions

_(Inspired by [Fuzzy Definitions](https://github.com/jrieken/fuzzy-definitions) and [Find All References](https://github.com/gayanhewa/vscode-find-all-references))_

Run (blazing fast) textual search to provide 'Go to Definitions' and 'Find All References' for JavaScript.

Helpful when navigating large JavaScript codebase (facepalm...).

## Requirement

- Install [ripgrep](https://github.com/BurntSushi/ripgrep) and make it available in `$PATH` (run '`rg`' in commandline to verify)

## How it works

It hooks onto 'Go to Definitions' and 'Find All References' for JavaScript (and .jsx). If no reliable definitions can be inferred by built-in Intellisense engine, this extension will perform a workspace textual search using [ripgrep](https://github.com/BurntSushi/ripgrep), a searching utility, to provide some 'likely-to-be' definitions.

It respects `.gitignore`, and only looks at JavaScript (and .jsx) files.

# Release Notes

### 0.0.7

- now also registered as 'Find All References' provider

### 0.0.6

- add Windows support

### 0.0.5

- now also searches .vue files for definitions

### 0.0.2

- now also searches .ts/.tsx files for definitions

### 0.0.1

- it now works
