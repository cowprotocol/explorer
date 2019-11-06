import { TokenDetails } from 'types'

// eslint-disable-next-line
function noop(..._args: any[]): void {}

export const log = process.env.NODE_ENV === 'test' ? noop : console.log

export function getToken<T extends TokenDetails>(
  key: string,
  value: string | undefined = '',
  tokens: T[] | undefined | null,
): T | undefined {
  const valueUppercase = value.toUpperCase()
  return (tokens || []).find(token => {
    const value = token[key]
    if (value) {
      return value.toString().toUpperCase() === valueUppercase
    } else {
      return false
    }
  })
}
