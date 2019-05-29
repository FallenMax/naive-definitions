export interface RgOutput {
  type: string
  data: Data
}

interface Data {
  path: Path
  lines: Path
  line_number: number
  absolute_offset: number
  submatches: Submatch[]
}

interface Submatch {
  match: Path
  start: number
  end: number
}

interface Path {
  text: string
}
