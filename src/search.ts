import * as path from 'path'
import { log, run } from './util'

export interface Location {
  file: string
  line: number
  lineEnd: number
  column: number
  columnEnd: number
}
const parse = (out: string, word: string) => {
  const locations = out
    .split('\n')
    .filter(Boolean)
    /**
     * output:
     *
     * /Users/fallenmax/code/github/naive-definitions/test/input/file2.js:1:1:var a1
     */
    .map((match) => {
      const [_, file, line, _col, content] =
        /^([\s\S]*):(\d+):(\d+):([\s\S]*)$/.exec(match) || []

      if (!content) return undefined

      const col = content.indexOf(word)
      if (col === -1) {
        // for '[Omitted long line with 1 matches]'
        return undefined
      }

      const found = {
        file,
        line: Number(line) - 1,
        lineEnd: Number(line) - 1,
        column: col,
        columnEnd: col + word.length,
      }

      return found
    })
    .filter(Boolean)
    .sort((a, b) =>
      a.file === b.file
        ? a.line === b.line
          ? a.column - b.column
          : a.line - b.line
        : a.file < b.file
        ? -1
        : 1,
    )
  return locations
}

export async function search({
  word,
  patterns,
  directory,
  fileGlobs,
  fromFile,
}: {
  word: string
  patterns: string[]
  directory: string
  fileGlobs: string[]
  fromFile?: string
}): Promise<Location[]> {
  try {
    log('search: ', word)
    const command = [
      'rg',
      '--column',
      '--color never',
      '--max-columns 1024', // omit *.min.js results
      `--max-filesize 1M`, // omit bundled js
      ...patterns.map((p) => `-e "${p.replace('%s', word)}"`),
      ...fileGlobs.map((p) => `--glob "${p}"`),
      `"${directory}"`,
    ].join(' ')
    const { stdout, stderr } = await run(command, {
      cwd: directory,
      timeout: 5000,
      maxBuffer: 1024 * 1024 * 10, // 10M
    })
    log('<-', stdout, stderr)
    let results = stdout ? parse(stdout, word) : []
    log('results: ', results)

    // Sort results based on nearness to fromFile
    if (fromFile) {
      results.sort((a, b) => {
        const scoreA = computeNearnessScore(fromFile, a.file)
        const scoreB = computeNearnessScore(fromFile, b.file)
        return scoreA - scoreB
      })
    }

    return results
  } catch (error) {
    console.error('[naive-definitions] search error:', error)
    throw error
  }
}

/**
 * Compute the nearness score of two files, the lower the score, the closer the files are
 */
const computeNearnessScore = (fromFile: string, toFile: string): number => {
  if (fromFile === toFile) return 0
  const relativePath = path.relative(path.dirname(fromFile), toFile)
  return relativePath.split(path.sep).length
}
