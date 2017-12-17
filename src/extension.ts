'use strict'

import * as vscode from 'vscode'
import { NaiveGoToDefinition, isSearchAvail } from './search'

let unavailMessageShown = false

export function activate(context: vscode.ExtensionContext) {
  console.log('activated')
  // let config = vscode.workspace.getConfiguration('naivedefinitions')
  if (!isSearchAvail()) {
    if (!unavailMessageShown) {
      unavailMessageShown = true
      vscode.window.showErrorMessage(`"ripgrep" not installed, ""`)
    }
  } else {
    context.subscriptions.push(
      vscode.languages.registerDefinitionProvider('javascript', {
        provideDefinition: NaiveGoToDefinition,
      })
    )
  }
}
