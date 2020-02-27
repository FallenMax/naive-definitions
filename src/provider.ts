'use strict'
import { searchForDefinition, Location, searchForReference } from './search'
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
    new vscode.Range(line, column, lineEnd, columnEnd),
  )

let ignoreNextDefinitionSearch = false
export async function naiveProvideDefinition(
  document: vscode.TextDocument,
  pos: vscode.Position,
): Promise<vscode.Location[]> {
  if (ignoreNextDefinitionSearch) return []

  try {
    const range = document.getWordRangeAtPosition(pos)
    if (!range) return []

    const word = document.getText(range)

    ignoreNextDefinitionSearch = true
    const otherProviderResults = await vscode.commands.executeCommand<
      vscode.Location[]
    >('vscode.executeDefinitionProvider', document.uri, pos)
    ignoreNextDefinitionSearch = false

    if (otherProviderResults.length) {
      return []
    }

    const locations = (
      await searchForDefinition(word, vscode.workspace.rootPath)
    ).map((d) => toVscodeLocation(d))
    return locations
  } catch (error) {
    console.error('[naive-definitions]', error)
    ignoreNextDefinitionSearch = false
    throw error
  }
}

let ignoreNextReferenceSearch = false
export async function naiveProvideReference(
  document: vscode.TextDocument,
  pos: vscode.Position,
): Promise<vscode.Location[]> {
  if (ignoreNextReferenceSearch) return []

  try {
    const range = document.getWordRangeAtPosition(pos)
    if (!range) return []

    const word = document.getText(range)

    ignoreNextReferenceSearch = true
    const otherProviderResults = await vscode.commands.executeCommand<
      vscode.Location[]
    >('vscode.executeReferenceProvider', document.uri, pos)
    ignoreNextReferenceSearch = false

    if (otherProviderResults.length) {
      return []
    }

    const locations = (
      await searchForReference(word, vscode.workspace.rootPath)
    ).map((d) => toVscodeLocation(d))
    return locations
  } catch (error) {
    console.error('[naive-definitions]', error)
    ignoreNextReferenceSearch = false
    throw error
  }
}
