import {
  exec,
  ExecOptions,
  ExecOptionsWithStringEncoding,
  execSync,
} from 'child_process'

export async function run(command: string, options: ExecOptions = {}) {
  return new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
    const execOptions: ExecOptionsWithStringEncoding = {
      ...options,
      encoding: 'utf8',
    }

    exec(command, execOptions, (error, stdout, stderr) => {
      if (error) {
        reject(error)
      } else {
        resolve({ stdout, stderr })
      }
    })
  })
}

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

const isDebugging = false

export function log(...args: any[]) {
  if (isDebugging) {
    console.info.apply(console, args)
  }
}

export function wait(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time))
}
