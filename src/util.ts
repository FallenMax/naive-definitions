import {
  execFile,
  ExecFileOptionsWithStringEncoding,
  execFileSync,
} from 'child_process'

export type RunOptions = Omit<ExecFileOptionsWithStringEncoding, 'encoding'> & {
  allowedExitCodes?: number[]
}

export async function run(
  command: string,
  args: string[],
  options: RunOptions = {},
) {
  return new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
    const { allowedExitCodes = [0], ...optionsWithoutExitCodes } = options
    const execOptions: ExecFileOptionsWithStringEncoding = {
      ...optionsWithoutExitCodes,
      encoding: 'utf8',
    }

    execFile(command, args, execOptions, (error, stdout, stderr) => {
      if (error && !allowedExitCodes.includes(getExitCode(error.code))) {
        reject(error)
      } else {
        resolve({ stdout, stderr })
      }
    })
  })
}

function getExitCode(code: string | number | undefined) {
  return typeof code === 'number' ? code : 1
}

export function checkRg(rgPath = 'rg'): string | undefined {
  try {
    const [rg, version] = execFileSync(rgPath, ['-V'], {
      encoding: 'utf8',
    }).split(' ')
    if (rg !== 'ripgrep') {
      throw new Error('not found')
    }
    const [major, minor] = version.split('.').map((s) => Number(s))
    if (major === 0 && minor < 10) {
      return 'Require `rg` has version >= 0.10.0, instead it is ' + version
    }
  } catch (error) {
    return `\`${rgPath}\` (ripgrep) is not available. Install ripgrep, make it available in $PATH, or set naiveDefinitions.rgPath.`
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
