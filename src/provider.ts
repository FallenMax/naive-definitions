'use strict'
import { searchForDefinition, Location } from './search'
import * as vscode from 'vscode'

const toVscodeLocation = ({
  file,
  line,
  lineEnd,
  column,
  columnEnd,
}: Location): vscode.Location =>
  new vscode.Location(
    vscode.Uri.file(file),
    new vscode.Range(line, column, lineEnd, columnEnd)
  )

let ignoreNextSearch = false
export async function naiveProvideDefinition(
  document: vscode.TextDocument,
  pos: vscode.Position
): Promise<vscode.Location[]> {
  if (ignoreNextSearch) return []

  try {
    const range = document.getWordRangeAtPosition(pos)
    if (!range) return []

    const word = document.getText(range)

    ignoreNextSearch = true
    const otherProviderResults = await vscode.commands.executeCommand<
      vscode.Location[]
    >('vscode.executeDefinitionProvider', document.uri, pos)
    ignoreNextSearch = false

    if (otherProviderResults.length) {
      return []
    }

    const locations = (await searchForDefinition(
      word,
      vscode.workspace.rootPath
    )).map(d => toVscodeLocation(d))
    return locations
  } catch (error) {
    console.error('[naive-definitions]', error)
    ignoreNextSearch = false
    throw error
  }
}
