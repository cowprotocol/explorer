import { tokenList } from '../data'
import { getToken, isAnAddressAccount, isAnOrderId, isEns } from 'utils'
import BN from 'bn.js'
import { pathAccordingTo } from 'hooks/useSearchSubmit'

describe('getToken', () => {
  describe('empty cases', () => {
    it('returns `undefined` on `undefined` symbol', () => {
      expect(getToken('symbol', undefined, tokenList)).toBeUndefined()
    })
    it('returns `undefined` on empty tokens list', () => {
      expect(getToken('symbol', 'any', [])).toBeUndefined()
    })
    it('returns `undefined` on `undefined` tokens list', () => {
      expect(getToken('symbol', 'any', undefined)).toBeUndefined()
    })
    it('returns `undefined` on `null` tokens list', () => {
      expect(getToken('symbol', 'any', null)).toBeUndefined()
    })
    it('returns `undefined` when value not in tokens list', () => {
      expect(getToken('symbol', 'any', tokenList)).toBeUndefined()
    })
    it('returns `undefined` when id not found', () => {
      expect(getToken('id', -1, tokenList)).toBeUndefined()
    })
  })

  describe('value is a number', () => {
    it('returns token when id in the list', () => {
      const expected = tokenList[0]
      const actual = getToken('id', expected.id, tokenList)
      expect(actual).not.toBeUndefined()
      expect(actual).toBe(expected)
    })
  })

  describe('string case', () => {
    it('ignores `value` case', () => {
      const expected = tokenList[0]
      const lowerCaseSymbol = expected.symbol?.toLowerCase()
      const actual = getToken('symbol', lowerCaseSymbol, tokenList)
      expect(actual).not.toBeUndefined()
      expect(actual).toBe(expected)
    })

    it("it's case insensitive", () => {
      const expected = tokenList[0]
      const actual = getToken('symbol', expected.symbol?.toLowerCase(), tokenList)
      expect(actual).not.toBeUndefined()
      expect(actual).toBe(expected)
    })
  })

  describe('TokenDetails', () => {
    it('finds a token by symbol', () => {
      const expected = tokenList[0]
      const actual = getToken('symbol', expected.symbol, tokenList)
      expect(actual).not.toBeUndefined()
      expect(actual).toBe(expected)
    })

    it('finds a token by address', () => {
      const expected = tokenList[0]
      const actual = getToken('address', expected.address, tokenList)
      expect(actual).not.toBeUndefined()
      expect(actual).toBe(expected)
    })
  })

  describe('TokenBalanceDetails', () => {
    const balances = [
      {
        ...tokenList[0],
        exchangeBalance: new BN(0),
        depositingBalance: new BN(0),
        withdrawingBalance: new BN(0),
        claimable: true,
        walletBalance: new BN(0),
        enabled: true,
        highlighted: false,
        enabling: false,
        claiming: false,
      },
    ]
    it('finds item in TokenBalanceDetails[]', () => {
      const expected = balances[0]
      const actual = getToken('symbol', expected.symbol, balances)
      expect(actual).not.toBeUndefined()
      expect(actual).toBe(expected)
    })
  })
})

describe('isAnOrderId', () => {
  test('Is orderId', () => {
    const text =
      '0x405bd0278c11399f84f10e19fb9b45123996e7d0a68a60ddebc3b9581576b484ff714b8b0e2700303ec912bd40496c3997ceea2b614b17d9'

    const result = isAnOrderId(text)

    expect(result).toBe(true)
  })

  test('Is not orderId', () => {
    const text = '0xb6BAd41ae76A11D10f7b0E664C5007b908bC77C9'

    const result = isAnOrderId(text)

    expect(result).toBe(false)
  })
})

describe('isAnAddressAccount', () => {
  test('Is an Address account', () => {
    const text = '0xb6BAd41ae76A11D10f7b0E664C5007b908bC77C9'

    const result = isAnAddressAccount(text)

    expect(result).toBe(true)
  })

  test('Is not an Address account', () => {
    const text =
      '0x405bd0278c11399F84f10e19fb9b45123996e7d0a68a60ddebc3b9581576b484ff714b8b0e2700303ec912bd40496c3997ceea2b614b17d9'

    const result = isAnAddressAccount(text)

    expect(result).toBe(false)
  })
})

describe('pathAccordingTo', () => {
  it('should return the search word when it does not match', () => {
    const text = 'Invalid Search'

    const result = pathAccordingTo(text)

    expect(result).toBe('search')
  })

  it('should return the address word when it match', () => {
    const text = '0xb6BAd41ae76A11D10f7b0E664C5007b908bC77C9'

    const result = pathAccordingTo(text)

    expect(result).toBe('address')
  })
})

describe('isEns', () => {
  it('should return true for valid ens addresses', () => {
    const text = 'vitalik.eth'

    const result = isEns(text)

    expect(result).toBe(true)
  })
})
