'use strict'

import * as vscode from 'vscode'
import { extname, dirname, join } from 'path'
import { exec, execSync, ExecOptions, ExecFileOptions } from 'child_process'
import { commands } from 'vscode'

const run = async (command: string, options: ExecOptions = {}) =>
  new Promise<{ stdout: string; stderr: string }>((resolve, reject) =>
    exec(
      command,
      options,
      (error, stdout, stderr) =>
        error ? reject(error) : resolve({ stdout, stderr })
    )
  )

export function isSearchAvail() {
  try {
    const out = execSync('rg -V', { encoding: 'utf8' })
    return /^ripgrep [\d\.]+/.test(out)
  } catch (error) {
    return false
  }
}

async function search({
  word,
  patterns,
  directory,
}: {
  word: string
  patterns: string[]
  directory: string
}) {
  const parse = (out: string) => {
    const locations = out
      .split('\n')
      .filter(Boolean)
      .map(match => {
        const [file, line, column, ...rest] = match.split(':')
        const lineStr = rest.join(':')
        console.log('file, line, column, lineStr ', file, line, column, lineStr)
        const lineNum = parseInt(line, 10) - 1
        const columnNum = parseInt(column, 10) - 1

        return new vscode.Location(
          vscode.Uri.file(join(vscode.workspace.rootPath, file)),
          new vscode.Range(lineNum, columnNum, lineNum, columnNum + word.length)
        )
      })
    return locations
  }
  const command = [
    'rg',
    '--column',
    '--color',
    'never',
    '--type',
    'js',
    '-e',
    ...patterns.map(p => `'${p}'`),
  ].join(' ')

  console.log('command ', command)
  const { stdout, stderr } = await run(command, {
    cwd: directory,
    timeout: 5000,
  })
  return stdout ? parse(stdout) : []
}

async function searchForDefinition(word: string, directory: string) {
  const wait = (time: number) =>
    new Promise(resolve => setTimeout(resolve, time))

  const patterns = [`(var|let|const)[^=]+\\b${word}\\b`]

  return Promise.race([
    wait(2000).then(e => {
      throw new Error('ERR_RG_TIMEOUT')
    }),
    search({
      word,
      patterns,
      directory: vscode.workspace.rootPath,
    }).catch(e => []),
  ])
}

let ignoreNextSearch = false
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
    return await searchForDefinition(word, vscode.workspace.rootPath)

    return otherProviderResults && otherProviderResults.length
      ? []
      : await searchForDefinition(word, vscode.workspace.rootPath)
  } catch (error) {
    console.error('[naive-definitions]', error)
    ignoreNextSearch = false
    throw error
  }
}
