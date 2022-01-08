import { log, run } from './util'

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
  log('search: ', word)
  const parse = (out: string) => {
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
  const command = [
    'rg',
    '--column',
    '--color never',
    '--type js --type ts --type-add "vue:*.vue" --type vue',
    '--max-columns 1024', // omit *.min.js results
    `--max-filesize 1M`, // omit bundled js
    ...patterns.map((p) => ` -e "${p}"`),
    `"${directory}"`,
  ].join(' ')
  log('->', command)
  const { stdout, stderr } = await run(command, {
    cwd: directory,
    timeout: 5000,
    maxBuffer: 1024 * 1024 * 10, // 10M
  })
  log('<-', stdout, stderr)
  const results = stdout ? parse(stdout) : []
  log('results: ', results)
  return results
}

export async function searchForDefinition(
  word: string,
  directory: string,
): Promise<Location[]> {
  const wait = (time: number) =>
    new Promise((resolve) => setTimeout(resolve, time))

  const patterns = [
    // var word
    // let word
    // const word
    `(var|let|const)[^=]+\\b${word}\\b`,

    // word =
    // obj.word =
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
    wait(5000).then((e) => {
      throw new Error('ERR_TIMEOUT')
    }),
    search({
      word,
      patterns,
      directory,
    }),
  ]).catch((e) => {
    console.error(e)
    return [] as Location[]
  })
}

export async function searchForReference(
  word: string,
  directory: string,
): Promise<Location[]> {
  const wait = (time: number) =>
    new Promise((resolve) => setTimeout(resolve, time))

  const patterns = [
    // word
    `\\b${word}\\b`,
  ]

  return Promise.race([
    wait(5000).then((e) => {
      throw new Error('ERR_TIMEOUT')
    }),
    search({
      word,
      patterns,
      directory,
    }),
  ]).catch((e) => {
    console.error(e)
    return [] as Location[]
  })
}
