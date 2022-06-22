type ThemeColor = 'green' | 'red1' | 'grey'

export function calcDiff(a: number, b: number): number {
  return (a - b === 0 ? 0 : (100 * (a - b)) / b) || 0
}

export function getColorBySign(n: number): ThemeColor {
  if (n > 0) {
    return 'green'
  } else if (n < 0) {
    return 'red1'
  }

  return 'grey'
}
