const { searchForDefinition } = require('../src/search')
const path = require('path')

const inputPath = path.resolve(__dirname, '../test/input')

test('(var|let|const) word', async () => {
  expect.assertions(3)

  expect(await searchForDefinition('a1', inputPath)).toEqual([
    { column: 4, columnEnd: 6, file: 'file1.js', line: 0, lineEnd: 0 },
    { column: 4, columnEnd: 6, file: 'file2.js', line: 0, lineEnd: 0 },
    {
      column: 4,
      columnEnd: 6,
      file: 'subfolder/file4.js',
      line: 0,
      lineEnd: 0,
    },
  ])

  expect(await searchForDefinition('a2', inputPath)).toEqual([
    { column: 4, columnEnd: 6, file: 'file1.js', line: 1, lineEnd: 1 },
  ])

  expect(await searchForDefinition('a3', inputPath)).toEqual([
    { column: 6, columnEnd: 8, file: 'file1.js', line: 2, lineEnd: 2 },
  ])
})

test('function word (){}', async () => {
  expect.assertions(1)

  expect(await searchForDefinition('a7', inputPath)).toEqual([
    { column: 9, columnEnd: 11, file: 'file1.js', line: 6, lineEnd: 6 },
  ])
})
