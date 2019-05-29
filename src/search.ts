import { run } from './util'
import { RgOutput } from './types/rg'

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
        const data = (match as RgOutput).data
        const lineText = data.lines.text
        const start = lineText.indexOf(word)
        const end = start + word.length

        return {
          file: data.path.text,
          line: data.line_number - 1,
          lineEnd: data.line_number - 1,
          column: start,
          columnEnd: end,
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

export async function searchForDefinition(
  word: string,
  directory: string
): Promise<Location[]> {
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

    // key:value
    `\\b${word}\\b\\s*:`,
    `^\\s*(async|public|private|protected)?\\s*${word}\\s*\\([^\\)]*\\)\\s*\\{`,

    // class
    `\\bclass ${word}\\b`,
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
    return [] as Location[]
  })
}
