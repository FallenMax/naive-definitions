import { exec, ExecOptions, execSync } from 'child_process'

export const run = async (command: string, options: ExecOptions = {}) =>
  new Promise<{ stdout: string; stderr: string }>((resolve, reject) =>
    exec(command, options, (error, stdout, stderr) =>
      error ? reject(error) : resolve({ stdout, stderr }),
    ),
  )

export function checkRg(): string | undefined {
  try {
    const [rg, version] = execSync('rg -V', { encoding: 'utf8' }).split(' ')
    if (rg !== 'ripgrep') {
      throw new Error('not found')
    }
    const [major, minor] = version.split('.').map((s) => Number(s))
    if (major === 0 && minor < 10) {
      return 'Require `rg` has version >= 0.10.0, instead it is ' + version
    }
  } catch (error) {
    return '`rg` (ripgrep) is not found in $PATH, please refer to "naive-definitions" README.md'
  }
}
