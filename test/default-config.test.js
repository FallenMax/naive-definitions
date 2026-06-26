import fs from 'fs'
import path from 'path'
import { expect, test } from 'vitest'
import { search } from '../src/search'

const packageJson = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf8'),
)

const directory = path.resolve(__dirname, '../test/input/defaults')

function getLanguageConfig(language) {
  const configs =
    packageJson.contributes.configuration.properties[
      'naiveDefinitions.languageConfigs'
    ].default
  return configs.find((config) => config.languages.includes(language))
}

async function find(language, word) {
  const config = getLanguageConfig(language)

  return search({
    word,
    directory,
    patterns: config.definitionPatterns,
    fileGlobs: config.fileGlobs,
  })
}

function p(file, line, col, colEnd) {
  return {
    column: col,
    columnEnd: colEnd,
    file: path.join(directory, file),
    line,
    lineEnd: line,
  }
}

test('default JavaScript patterns', async () => {
  expect(await find('javascript', 'jsValue')).toEqual([
    p('javascript.js', 0, 6, 13),
  ])
  expect(await find('javascript', 'jsFunction')).toEqual([
    p('javascript.js', 2, 9, 19),
  ])
  expect(await find('javascript', 'JsClass')).toEqual([
    p('javascript.js', 4, 6, 13),
  ])
  expect(await find('javascript', 'jsMethod')).toEqual([
    p('javascript.js', 5, 2, 10),
  ])
  expect(await find('javascript', 'jsKey')).toEqual([
    p('javascript.js', 9, 2, 7),
  ])
  expect(await find('javascript', 'jsAssigned')).toEqual([
    p('javascript.js', 12, 10, 20),
  ])
  expect(await find('javascript', 'jsAsyncFunction')).toEqual([
    p('typescript.ts', 0, 22, 37),
  ])
  expect(await find('javascript', 'JsTypeAlias')).toEqual([
    p('typescript.ts', 2, 5, 16),
  ])
  expect(await find('javascript', 'JsInterface')).toEqual([
    p('typescript.ts', 4, 10, 21),
  ])
  expect(await find('javascript', 'JsEnum')).toEqual([
    p('typescript.ts', 6, 5, 11),
  ])
  expect(await find('javascript', 'JsNamespace')).toEqual([
    p('typescript.ts', 10, 10, 21),
  ])
  expect(await find('javascript', 'jsStaticMethod')).toEqual([
    p('typescript.ts', 13, 9, 23),
  ])
  expect(await find('javascript', 'jsAsyncMethod')).toEqual([
    p('typescript.ts', 14, 8, 21),
  ])
  expect(await find('javascript', 'jsGetter')).toEqual([
    p('typescript.ts', 15, 6, 14),
  ])
  expect(await find('javascript', 'jsImportAlias')).toEqual([
    p('typescript.ts', 20, 23, 36),
  ])
})

test('default Python patterns', async () => {
  expect(await find('python', 'py_value')).toEqual([
    p('python.py', 0, 0, 8),
  ])
  expect(await find('python', 'py_typed')).toEqual([
    p('python.py', 1, 0, 8),
  ])
  expect(await find('python', 'PyTypeAlias')).toEqual([
    p('python.py', 2, 5, 16),
  ])
  expect(await find('python', 'py_file')).toEqual([
    p('python.py', 3, 21, 28),
  ])
  expect(await find('python', 'py_walrus')).toEqual([
    p('python.py', 6, 3, 12),
  ])
  expect(await find('python', 'py_function')).toEqual([
    p('python.py', 9, 4, 15),
  ])
  expect(await find('python', 'py_async_function')).toEqual([
    p('python.py', 12, 10, 27),
  ])
  expect(await find('python', 'PyClass')).toEqual([
    p('python.py', 15, 6, 13),
  ])
  expect(await find('python', 'py_method')).toEqual([
    p('python.py', 16, 8, 17),
  ])
  expect(await find('python', 'py_stub_function')).toEqual([
    p('python.pyi', 0, 4, 20),
  ])
  expect(await find('python', 'PyStubClass')).toEqual([
    p('python.pyi', 2, 6, 17),
  ])
})

test('default Ruby patterns', async () => {
  expect(await find('ruby', 'ruby_value')).toEqual([
    p('ruby.rb', 0, 0, 10),
  ])
  expect(await find('ruby', 'ruby_method')).toEqual([
    p('ruby.rb', 2, 4, 15),
  ])
  expect(await find('ruby', 'ruby_singleton')).toEqual([
    p('ruby.rb', 5, 9, 23),
  ])
  expect(await find('ruby', 'RubyClass')).toEqual([
    p('ruby.rb', 8, 6, 15),
  ])
  expect(await find('ruby', 'ruby_attr')).toEqual([
    p('ruby.rb', 9, 15, 24),
  ])
  expect(await find('ruby', 'RubyModule')).toEqual([
    p('ruby.rb', 12, 7, 17),
  ])
})

test('default PHP patterns', async () => {
  expect(await find('php', 'phpValue')).toEqual([
    p('php.php', 2, 1, 9),
  ])
  expect(await find('php', 'phpFunction')).toEqual([
    p('php.php', 4, 9, 20),
  ])
  expect(await find('php', 'PhpClass')).toEqual([
    p('php.php', 6, 6, 14),
  ])
  expect(await find('php', 'PhpInterface')).toEqual([
    p('php.php', 8, 10, 22),
  ])
  expect(await find('php', 'PhpTrait')).toEqual([
    p('php.php', 10, 6, 14),
  ])
})
