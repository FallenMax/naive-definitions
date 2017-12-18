'use strict'

import * as vscode from 'vscode'
import { NaiveGoToDefinition, isSearchAvail } from './provider'

let unavailMessageShown = false

export function activate(context: vscode.ExtensionContext) {
  if (!isSearchAvail()) {
    if (!unavailMessageShown) {
      unavailMessageShown = true
      vscode.window.showErrorMessage(
        `[naive-definitions] "ripgrep" is not found in $PATH, please refer to "naive-definitions" README.md`
      )
    }
  } else {
    context.subscriptions.push(
      vscode.languages.registerDefinitionProvider('javascript', {
        provideDefinition: NaiveGoToDefinition,
      })
    )
  }
}
