'use strict'
import * as vscode from 'vscode'
import { Location, searchForDefinition, searchForReference } from './search'

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

export async function naiveProvideDefinition(
  document: vscode.TextDocument,
  pos: vscode.Position,
): Promise<vscode.Location[]> {
  try {
    const range = document.getWordRangeAtPosition(pos)
    if (!range) return []

    const word = document.getText(range)

    const locations = (
      await searchForDefinition(word, vscode.workspace.rootPath)
    ).map((d) => toVscodeLocation(d))
    return locations
  } catch (error) {
    console.error('[naive-definitions]', error)
    throw error
  }
}

export async function naiveProvideReference(
  document: vscode.TextDocument,
  pos: vscode.Position,
): Promise<vscode.Location[]> {
  try {
    const range = document.getWordRangeAtPosition(pos)
    if (!range) return []

    const word = document.getText(range)

    const locations = (
      await searchForReference(word, vscode.workspace.rootPath)
    ).map((d) => toVscodeLocation(d))
    return locations
  } catch (error) {
    console.error('[naive-definitions]', error)
    throw error
  }
}
