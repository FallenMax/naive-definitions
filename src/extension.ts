import * as vscode from 'vscode'
import { naiveProvideDefinition } from './provider'
import { checkRg } from './util'

let hasShownError = false

export function activate(context: vscode.ExtensionContext) {
  const error = checkRg()
  if (error) {
    if (!hasShownError) {
      hasShownError = true
      vscode.window.showErrorMessage(`[naive-definitions] ${error}`)
    }
  } else {
    const langs = [
      'javascript',
      'javascriptreact',
      'typescript',
      'typescriptreact',
      'vue',
    ]
    const langProviders = langs.map(lang =>
      vscode.languages.registerDefinitionProvider(lang, {
        provideDefinition: naiveProvideDefinition,
      })
    )
    context.subscriptions.push(...langProviders)
  }
}
