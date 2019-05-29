import { run } from './util'
import { RgOutput } from './types/rg_output'

export interface Location {
  file: string
  line: number
  lineEnd: number
  column: number
  columnEnd: number
}
async function search({
  word,
  patterns,
  directory,
}: {
  word: string
  patterns: string[]
  directory: string
}): Promise<Location[]> {
  const parse = (out: string) => {
    const locations = out
      .split('\n')
      .filter(Boolean)
      .map(line => JSON.parse(line))
      .filter(result => result.type && result.type === 'match')
      .map(match => {
        const {
          path: { text: file },
          line_number,
          submatches: [{ start: column, end: columnEnd }],
        } = (match as RgOutput).data

        return {
          file,
          line: line_number - 1,
          lineEnd: line_number - 1,
          column,
          columnEnd,
        }
      })
      .sort((a, b) =>
        a.file === b.file
          ? a.line === b.line
            ? a.column - b.column
            : a.line - b.line
          : a.file < b.file
          ? -1
          : 1
      )
    return locations
  }
  const command = [
    'rg --json --column --color never --type js --type ts --type-add vue:*.vue --type vue',
    ...patterns.map(p => ` -e "${p}"`),
    `"${directory}"`,
  ].join(' ')

  const { stdout, stderr } = await run(command, {
    cwd: directory,
    timeout: 5000,
  })
  return stdout ? parse(stdout) : []
}

export async function searchForDefinition(word: string, directory: string) {
  const wait = (time: number) =>
    new Promise(resolve => setTimeout(resolve, time))

  const patterns = [
    // var word
    // let word
    // const word
    `(var|let|const)[^=]+\\b${word}\\b`,

    // word =
    `\\b${word}\\b\\s*=[^=]+`,

    // function word (){}
    `\\bfunction\\b.*\\b${word}\\b`,

    // word: someValue
    `\\b${word}\\b\\s*:`,

    // word () {    // es6 object-method
    `^\\s*${word}\\s*\\([^\\)]*\\)\\s*\\{`,
  ]

  return Promise.race([
    wait(5000).then(e => {
      throw new Error('ERR_RG_TIMEOUT')
    }),
    search({
      word,
      patterns,
      directory,
    }),
  ]).catch(e => {
    console.error('[naive-definitions]', e)
    return [] as Location[]
  })
}
