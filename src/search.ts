'use strict'

import * as vscode from 'vscode'
import { extname, dirname, join } from 'path'
import { exec, execSync } from 'child_process'

let ignoreNextSearch = false

export async function NaiveSearch(
  document: vscode.TextDocument,
  pos: vscode.Position,
  token: vscode.CancellationToken
) {
  if (ignoreNextSearch) return []

  try {
    const range = document.getWordRangeAtPosition(pos)

    if (!range) return Promise.resolve([])

    ignoreNextSearch = true

    const word = document.getText(range)

    const otherProviderResults = await vscode.commands.executeCommand<
      vscode.Location[]
    >('vscode.executeDefinitionProvider', document.uri, pos)

    ignoreNextSearch = false

    if (otherProviderResults && otherProviderResults.length) {
      return otherProviderResults
    } else {
      return []
    }
  } catch (error) {
    console.error('[naive-definitions]', error)
    ignoreNextSearch = false
    throw error
  }
}

function searchForDefinition({ document }) {
  // body
}

function nakDefinitionSearch(
  document: vscode.TextDocument,
  pos: vscode.Position,
  token: vscode.CancellationToken
): PromiseLike<vscode.Location[]> {
  return new Promise<vscode.Location[]>((resolve, reject) => {
    // let node = process.argv[0];
    let module = join(require.resolve('nak'), '../../bin/nak')
    let range = document.getWordRangeAtPosition(pos)
    let word = document.getText(range)
    let pattern = `(let|const|var|function|class)\\s+${word}|${word}\\s*:`
    let cmd = `node ${module} --ackmate -G "*${extname(
      document.fileName
    )}" -d "*node_modules*" "${pattern}" ${vscode.workspace.rootPath}`
    const nak = exec(cmd, (err, stdout, stderr) => {
      if (err || stderr) {
        return reject(err || stderr)
      }

      let result: vscode.Location[] = []
      let lines = stdout.split('\n')
      let lastUri: vscode.Uri
      let lastMatch: RegExpMatchArray

      for (let line of lines) {
        if (line[0] === ':') {
          lastUri = vscode.Uri.file(line.substr(1))
        } else if ((lastMatch = /^(\d+);\d+ (\d+)/.exec(line))) {
          let line = parseInt(lastMatch[1]) - 1
          let end = parseInt(lastMatch[2])
          range = new vscode.Range(line, end - word.length + 1, line, end)

          if (
            lastUri.toString() !== document.uri.toString() ||
            !range.contains(pos)
          ) {
            result.push(new vscode.Location(lastUri, range))
          }
        }
      }

      resolve(result)
    })

    // wait no longer then 2sec for nak
    setTimeout(() => {
      resolve([])
      nak.kill()
    }, 2000)

    token.onCancellationRequested(() => nak.kill())
  })
}

export function isSearchAvail() {
  try {
    const out = execSync('rg -V', { encoding: 'utf8' })
    return /^ripgrep [\d\.]+/.test(out)
  } catch (error) {
    return false
  }
}
