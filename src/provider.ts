'use strict'
import { searchForDefinition, Location } from './search'
import * as vscode from 'vscode'
import { extname, dirname, join } from 'path'
import { exec, execSync, ExecOptions, ExecFileOptions } from 'child_process'
import { commands } from 'vscode'

let ignoreNextSearch = false

export function isSearchAvail() {
  try {
    const out = execSync('rg -V', { encoding: 'utf8' })
    return /^ripgrep [\d\.]+/.test(out)
  } catch (error) {
    return false
  }
}

const toLocation = ({
  file,
  line,
  lineEnd,
  column,
  columnEnd,
}: Location): vscode.Location => {
  return new vscode.Location(
    vscode.Uri.file(join(vscode.workspace.rootPath, file)),
    new vscode.Range(line, column, lineEnd, columnEnd)
  )
}

export async function NaiveGoToDefinition(
  document: vscode.TextDocument,
  pos: vscode.Position,
  token: vscode.CancellationToken
): Promise<any[]> {
  if (ignoreNextSearch) return []

  try {
    const range = document.getWordRangeAtPosition(pos)
    if (!range) return Promise.resolve([])
    const word = document.getText(range)

    ignoreNextSearch = true
    const otherProviderResults = await vscode.commands.executeCommand<
      vscode.Location[]
    >('vscode.executeDefinitionProvider', document.uri, pos)
    ignoreNextSearch = false

    // debug
    // return (await searchForDefinition(word, vscode.workspace.rootPath)).map(d =>
    //   toLocation(d)
    // )

    return otherProviderResults && otherProviderResults.length
      ? []
      : (await searchForDefinition(word, vscode.workspace.rootPath)).map(d =>
          toLocation(d)
        )
  } catch (error) {
    console.error('[naive-definitions]', error)
    ignoreNextSearch = false
    throw error
  }
}
