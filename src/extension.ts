import * as vscode from 'vscode'
import { checkRg } from './util'
import { LanguageConfigs } from './types/config'
import { Location, search } from './search'

let hasShownError = false

const toVscodeLocation = ({
  file,
  line,
  lineEnd,
  column,
  columnEnd,
}: Location): vscode.Location =>
  new vscode.Location(
    vscode.Uri.file(file),
    new vscode.Range(line, column, lineEnd, columnEnd),
  )

export function activate(context: vscode.ExtensionContext) {
  const error = checkRg()
  if (error) {
    if (!hasShownError) {
      hasShownError = true
      vscode.window.showErrorMessage(`[naive-definitions] ${error}`)
    }
    return
  }

  const config = vscode.workspace.getConfiguration('naiveDefinitions')
  const languageConfigs = config.get<LanguageConfigs>('languageConfigs')
  for (const config of languageConfigs) {
    context.subscriptions.push(
      vscode.languages.registerDefinitionProvider(config.languages, {
        provideDefinition: async (document, pos, token) => {
          const range = document.getWordRangeAtPosition(pos)
          if (!range) return []

          const word = document.getText(range)
          if (!word) return []

          const directory = vscode.workspace.rootPath || ''
          const patterns = config.definitionPatterns.map((p) =>
            p.replace('%s', word),
          )
          const fileGlobs = config.fileGlobs
          const locations = (
            await search({ word, patterns, directory, fileGlobs })
          ).map(toVscodeLocation)
          return locations
        },
      }),
      vscode.languages.registerReferenceProvider(config.languages, {
        provideReferences: async (document, pos) => {
          const range = document.getWordRangeAtPosition(pos)
          if (!range) return []

          const word = document.getText(range)
          if (!word) return []

          const directory = vscode.workspace.rootPath || ''

          const patterns = config.referencePatterns.map((p) =>
            p.replace('%s', word),
          )
          const fileGlobs = config.fileGlobs
          const locations = (
            await search({ word, patterns, directory, fileGlobs })
          ).map(toVscodeLocation)
          return locations
        },
      }),
    )
  }
}
