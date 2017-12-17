'use strict'

import * as vscode from 'vscode'
import { NaiveSearch, isSearchAvail } from './search'

let errorMessageShown = false

export function activate(context: vscode.ExtensionContext) {
  console.log('activated')
  // let config = vscode.workspace.getConfiguration('naivedefinitions')
  if (!isSearchAvail()) {
    if (!errorMessageShown) {
      errorMessageShown = true
      vscode.window.showErrorMessage(`"ripgrep" not installed, ""`)
    }
  } else {
    context.subscriptions.push(
      vscode.languages.registerDefinitionProvider('javascript', {
        provideDefinition: NaiveSearch,
      })
    )
  }
}
