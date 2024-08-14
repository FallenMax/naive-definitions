import * as vscode from 'vscode'
import { Location, search } from './search'
import { LanguageConfigs } from './types/config'
import { checkRg } from './util'

function toVscodeLocation({
  file,
  line,
  lineEnd,
  column,
  columnEnd,
}: Location): vscode.Location {
  return new vscode.Location(
    vscode.Uri.file(file),
    new vscode.Range(line, column, lineEnd, columnEnd),
  )
}

let rgAvailable: boolean | undefined
const ensureRg = async () => {
  if (rgAvailable == null) {
    const error = checkRg()
    if (error) {
      vscode.window.showErrorMessage(`[naive-definitions] ${error}`)
      rgAvailable = false
    } else {
      rgAvailable = true
    }
  }

  if (!rgAvailable) {
    throw new Error('[naive-definitions] rg is not available')
  }
}

export function activate(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration('naiveDefinitions')
  const languageConfigs = config.get<LanguageConfigs>('languageConfigs')
  for (const config of languageConfigs) {
    context.subscriptions.push(
      vscode.languages.registerDefinitionProvider(config.languages, {
        provideDefinition: async (document, pos, token) => {
          await ensureRg()
          const range = document.getWordRangeAtPosition(pos)
          if (!range) return []

          let word = document.getText(range)
          word = removeSymbols(word)
          if (!word) return []

          const directory = vscode.workspace.rootPath || ''
          const patterns = config.definitionPatterns.map((p) =>
            p.replace('%s', word),
          )
          const fileGlobs = config.fileGlobs
          const locations = (
            await search({
              word,
              patterns,
              directory,
              fileGlobs,
              fromFile: document.uri.fsPath,
            })
          ).map(toVscodeLocation)
          return locations
        },
      }),
      vscode.languages.registerReferenceProvider(config.languages, {
        provideReferences: async (document, pos) => {
          await ensureRg()
          const range = document.getWordRangeAtPosition(pos)
          if (!range) return []

          let word = document.getText(range)
          word = removeSymbols(word)
          if (!word) return []

          const directory = vscode.workspace.rootPath || ''

          const patterns = config.referencePatterns.map((p) =>
            p.replace('%s', word),
          )
          const fileGlobs = config.fileGlobs
          const locations = (
            await search({
              word,
              patterns,
              directory,
              fileGlobs,
              fromFile: document.uri.fsPath,
            })
          ).map(toVscodeLocation)
          return locations
        },
      }),
    )
  }
}

function removeSymbols(word: string) {
  return word.replace(/[^\w\s]/g, '')
}
