import { search } from '../src/search'
import path from 'path'
import { expect, test } from 'vitest'

const directory = path.resolve(__dirname, '../test/input')
const file1 = path.join(directory, 'file1.js')
const file2 = path.join(directory, 'file2.js')
const file4 = path.join(directory, 'subfolder/file4.js')

const find = (word) =>
  search({
    word,
    directory,
    patterns: [
      '(var|let|const)[^=]+\\b%s\\b',
      '\\b%s\\b\\s*=[^=]+',
      '\\bfunction\\b.*\\b%s\\b',
      '\\b%s\\b\\s*:',
      '^\\s*(async|public|private|protected)?\\s*%s\\s*\\([^\\)]*\\)\\s*\\{',
      '\\bclass\\b.*\\b%s\\b',
    ],
    fileGlobs: ['**/*.js'],
  })

/** position */
const p = (file, line, col, colEnd) => {
  return { column: col, columnEnd: colEnd, file, line, lineEnd: line }
}

test('(var|let|const) word', async () => {
  expect(await find('a1')).toEqual([
    p(file1, 1, 4, 6),
    p(file2, 0, 4, 6),
    p(file4, 0, 4, 6),
  ])

  expect(await find('a2')).toEqual([p(file1, 2, 4, 6)])

  expect(await find('a3')).toEqual([p(file1, 3, 6, 8)])
})

test('function word (){}', async () => {
  expect(await find('a7')).toEqual([p(file1, 8, 9, 11)])
})

test('key: value', async () => {
  expect(await find('a15')).toEqual([p(file1, 19, 2, 5)])
  expect(await find('a16')).toEqual([p(file1, 20, 2, 5)])
  expect(await find('a17')).toEqual([p(file1, 21, 8, 11)])
})

test('class', async () => {
  expect(await find('a18')).toEqual([p(file1, 25, 6, 9)])
  expect(await find('a20')).toEqual([p(file1, 26, 2, 5)])
  expect(await find('a21')).toEqual([p(file1, 27, 2, 5)])
  expect(await find('a22')).toEqual([p(file1, 28, 10, 13)])
})

test('property assign', async () => {
  expect(await find('a23')).toEqual([p(file1, 36, 10, 13)])
})

test('handle spacestabs', async () => {
  expect(await find('a24')).toEqual([p(file1, 39, 8, 11)])
})
