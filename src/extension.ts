import * as path from 'path'
import * as vscode from 'vscode'
import { Location, search } from './search'
import { FallbackMode, LanguageConfig, LanguageConfigs } from './types/config'
import { checkRg } from './util'

function toVscodeLocation({
  file,
  line,
  lineEnd,
  column,
  columnEnd,
}: Location): vscode.Location {
  return new vscode.Location(
    vscode.Uri.file(file),
    new vscode.Range(line, column, lineEnd, columnEnd),
  )
}

let rgAvailable: boolean | undefined
let checkedRgPath: string | undefined
const suppressedRequests = new Set<string>()

async function ensureRg(rgPath: string) {
  if (checkedRgPath !== rgPath) {
    rgAvailable = undefined
    checkedRgPath = rgPath
  }

  if (rgAvailable == null) {
    const error = checkRg(rgPath)
    if (error) {
      vscode.window.showErrorMessage(`[naive-definitions] ${error}`)
      rgAvailable = false
    } else {
      rgAvailable = true
    }
  }

  if (!rgAvailable) {
    throw new Error('[naive-definitions] rg is not available')
  }
}

export function activate(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration('naiveDefinitions')
  const languageConfigs = config.get<LanguageConfigs>('languageConfigs') ?? []
  for (const languageConfig of languageConfigs) {
    context.subscriptions.push(
      vscode.languages.registerDefinitionProvider(languageConfig.languages, {
        provideDefinition: async (document, pos) => {
          if (isSuppressedRequest('definition', document, pos)) return []

          const config = getExtensionConfig()
          if (
            !(await shouldRunNaiveFallback(
              'definition',
              config.definitionFallbackMode,
              document,
              pos,
            ))
          ) {
            return []
          }

          return provideNaiveLocations(
            languageConfig,
            document,
            pos,
            languageConfig.definitionPatterns,
            config.rgPath,
          )
        },
      }),
      vscode.languages.registerReferenceProvider(languageConfig.languages, {
        provideReferences: async (document, pos) => {
          if (isSuppressedRequest('reference', document, pos)) return []

          const config = getExtensionConfig()
          if (
            !(await shouldRunNaiveFallback(
              'reference',
              config.referenceFallbackMode,
              document,
              pos,
            ))
          ) {
            return []
          }

          return provideNaiveLocations(
            languageConfig,
            document,
            pos,
            languageConfig.referencePatterns,
            config.rgPath,
          )
        },
      }),
    )
  }
}

function getExtensionConfig() {
  const config = vscode.workspace.getConfiguration('naiveDefinitions')

  return {
    definitionFallbackMode: parseFallbackMode(
      config.get<string>('definitionFallbackMode'),
    ),
    referenceFallbackMode: parseFallbackMode(
      config.get<string>('referenceFallbackMode'),
    ),
    rgPath: config.get<string>('rgPath', 'rg'),
  }
}

function parseFallbackMode(mode: string | undefined): FallbackMode {
  if (mode === 'always' || mode === 'never') return mode
  return 'whenNoOtherResults'
}

async function provideNaiveLocations(
  config: LanguageConfig,
  document: vscode.TextDocument,
  pos: vscode.Position,
  patterns: string[],
  rgPath: string,
) {
  await ensureRg(rgPath)
  const range = document.getWordRangeAtPosition(pos)
  if (!range) return []

  let word = document.getText(range)
  word = removeSymbols(word)
  if (!word) return []

  const directory = getSearchDirectory(document)
  const locations = (
    await search({
      word,
      patterns,
      directory,
      fileGlobs: config.fileGlobs,
      rgPath,
      fromFile: document.uri.fsPath,
    })
  ).map(toVscodeLocation)
  return locations
}

async function shouldRunNaiveFallback(
  kind: 'definition' | 'reference',
  mode: FallbackMode,
  document: vscode.TextDocument,
  pos: vscode.Position,
) {
  if (mode === 'always') return true
  if (mode === 'never') return false

  const requestKey = getRequestKey(kind, document, pos)
  suppressedRequests.add(requestKey)

  try {
    const command =
      kind === 'definition'
        ? 'vscode.executeDefinitionProvider'
        : 'vscode.executeReferenceProvider'
    const locations = await vscode.commands.executeCommand<unknown[]>(
      command,
      document.uri,
      pos,
    )
    return !locations || locations.length === 0
  } finally {
    suppressedRequests.delete(requestKey)
  }
}

function isSuppressedRequest(
  kind: 'definition' | 'reference',
  document: vscode.TextDocument,
  pos: vscode.Position,
) {
  return suppressedRequests.has(getRequestKey(kind, document, pos))
}

function getRequestKey(
  kind: 'definition' | 'reference',
  document: vscode.TextDocument,
  pos: vscode.Position,
) {
  return `${kind}:${document.uri.toString()}:${pos.line}:${pos.character}`
}

function getSearchDirectory(document: vscode.TextDocument) {
  const workspaceFolder = getWorkspaceFolder(document.uri)
  if (workspaceFolder) return workspaceFolder.uri.fsPath
  if (vscode.workspace.rootPath) return vscode.workspace.rootPath
  return path.dirname(document.uri.fsPath)
}

function getWorkspaceFolder(uri: vscode.Uri) {
  const workspace = vscode.workspace as typeof vscode.workspace & {
    getWorkspaceFolder?: (uri: vscode.Uri) => { uri: vscode.Uri } | undefined
  }
  return workspace.getWorkspaceFolder?.(uri)
}

function removeSymbols(word: string) {
  return word.replace(/[^\w\s]/g, '')
}
