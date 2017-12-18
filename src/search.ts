import { execSync } from 'child_process'
import { error } from 'util'
import { join } from 'path'
import { run } from './util'

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
      .map(match => {
        const [file, line, column, ...rest] = match.split(':')
        const lineStr = rest.join(':')
        const lineNum = parseInt(line, 10) - 1
        const columnNum = lineStr.search(new RegExp(`\\b${word}\\b`))

        return {
          file,
          line: lineNum,
          lineEnd: lineNum,
          column: columnNum,
          columnEnd: columnNum + word.length,
        }
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
    ...patterns.map(p => ` -e '${p}'`),
  ].join(' ')

  // console.log('command ', command)
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
    `\\b${word}\\b[^=]*=`,

    // function word (){}
    `\\bfunction\\b.*\\b${word}\\b`,
  ]

  return Promise.race([
    wait(2000).then(e => {
      throw new Error('ERR_RG_TIMEOUT')
    }),
    search({
      word,
      patterns,
      directory,
    }).catch(e => [] as Location[]),
  ])
}
