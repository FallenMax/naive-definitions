import { exec, ExecOptions } from 'child_process'

export const run = async (command: string, options: ExecOptions = {}) =>
  new Promise<{ stdout: string; stderr: string }>((resolve, reject) =>
    exec(
      command,
      options,
      (error, stdout, stderr) =>
        error ? reject(error) : resolve({ stdout, stderr })
    )
  )
