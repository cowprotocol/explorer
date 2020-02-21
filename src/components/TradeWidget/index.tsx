import React, { useState, useMemo, useCallback, useEffect } from 'react'
import styled from 'styled-components'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import switchTokenPair from 'assets/img/switch.svg'
import arrow from 'assets/img/arrow.svg'
import { FieldValues } from 'react-hook-form/dist/types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useHistory } from 'react-router'
import { toast } from 'toastify'

import TokenRow from './TokenRow'
import OrderValidity from './OrderValidity'
import Widget from 'components/Layout/Widget'
import OrdersWidget from 'components/OrdersWidget'
import { TxNotification } from 'components/TxNotification'

import { useForm, FormContext } from 'react-hook-form'
import { useParams } from 'react-router'
import useURLParams from 'hooks/useURLParams'
import { useTokenBalances } from 'hooks/useTokenBalances'
import { useWalletConnection } from 'hooks/useWalletConnection'
import { usePlaceOrder } from 'hooks/usePlaceOrder'
import { useQuery, buildSearchQuery } from 'hooks/useQuery'
import useGlobalState from 'hooks/useGlobalState'
import { savePendingOrdersAction, removePendingOrdersAction } from 'reducers-actions/pendingOrders'
import { MEDIA } from 'const'

import { tokenListApi } from 'api'

import { Network, TokenDetails } from 'types'

import { getToken, parseAmount, parseBigNumber } from 'utils'
import { ZERO } from 'const'
import Price from './Price'

const WrappedWidget = styled(Widget)`
  overflow-x: visible;
  min-width: 0;

  @media ${MEDIA.mobile} {
    flex-flow: column wrap;
    max-height: initial;
    min-height: initial;
  }
`

const WrappedForm = styled.form`
  display: flex;
  flex-flow: column wrap;
  width: 50%;
  padding: 1.6rem;
  box-sizing: border-box;

  @media ${MEDIA.mobile} {
    width: 100%;
  }

  > p {
    font-size: 1.3rem;
    color: #476481;
    letter-spacing: 0;
    text-align: center;
    margin: 1.6rem 0 0;
  }
`
// Switcharoo arrows
const IconWrapper = styled.a`
  margin: 1rem auto;

  > img {
    transition: opacity 0.2s ease-in-out;
    opacity: 0.5;
    &:hover {
      opacity: 1;
    }
  }
`

const WarningLabel = styled.code`
  background: #ffa8a8;
  border-radius: var(--border-radius);
  font-weight: bolder;
  margin: 0 auto 0.9375rem;
  padding: 6;
  text-align: center;
  width: 75%;
`

const SubmitButton = styled.button`
  background-color: #218dff;
  border-radius: 3rem;
  font-family: var(--font-default);
  font-size: 1.6rem;
  color: #ffffff;
  letter-spacing: 0.1rem;
  text-align: center;
  text-transform: uppercase;
  padding: 1rem 2rem;
  box-sizing: border-box;
  line-height: 1;
  width: 100%;
  font-weight: var(--font-weight-medium);
  height: 4.6rem;
  margin: 1rem auto;
  max-width: 32rem;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5rem;
  }
`

const OrdersPanel = styled.div`
  display: flex;
  flex-flow: column wrap;
  width: 50%;
  background: #edf2f7;
  border-radius: 0 0.6rem 0.6rem 0;
  box-sizing: border-box;

  > div {
    width: 100%;
    width: calc(100% - 1.6rem);
    height: auto;
    box-sizing: border-box;
    display: flex;
    flex-flow: row wrap;
    overflow-y: auto;
    border-radius: 0 0.6rem 0.6rem 0;
  }

  > div > h5 {
    width: 100%;
    margin: 0 auto;
    padding: 1.6rem 0 1rem;
    font-weight: var(--font-weight-medium);
    font-size: 1.6rem;
    color: #2f3e4e;
    letter-spacing: 0.03rem;
    text-align: center;
    box-sizing: border-box;
    text-align: center;
  }

  > button {
    width: 1.6rem;
    height: 100%;
    border-right: 0.1rem solid rgba(159, 180, 201, 0.5);
    background: #ecf2f7 url(${arrow}) no-repeat center/1.2rem 1rem;
    padding: 0;
    margin: 0;
    outline: 0;
    &:hover {
      background-color: #ecf2f7;
    }
  }
`

export const enum TradeFormTokenId {
  sellToken = 'sellToken',
  receiveToken = 'receiveToken',
  validUntil = 'validUntil',
  price = 'price',
  priceInverse = 'priceInverse',
}

export type TradeFormData = {
  [K in keyof typeof TradeFormTokenId]: string
}

export const DEFAULT_FORM_STATE = {
  sellToken: '0',
  receiveToken: '0',
  price: '0',

  // 2 days
  validUntil: '2880',
}

function _getReceiveTokenTooltipText(sellValue: string, receiveValue: string): string {
  const sellAmount = parseBigNumber(sellValue)

  if (!sellAmount || sellAmount.isZero()) {
    return 'First input the sell amount'
  }

  const receiveAmount = parseBigNumber(receiveValue)
  if (!receiveAmount || receiveAmount.isZero()) {
    return 'Input the price to get the receive tokens'
  } else {
    return 'Minimum amount of tokens you will receive if the order is fully executed at the given price'
  }
}

const TradeWidget: React.FC = () => {
  const { networkId, isConnected, userAddress } = useWalletConnection()
  const [, dispatch] = useGlobalState()

  // Avoid displaying an empty list of tokens when the wallet is not connected
  const fallBackNetworkId = networkId ? networkId : Network.Mainnet // fallback to mainnet

  const tokens = useMemo(() => tokenListApi.getTokens(fallBackNetworkId), [fallBackNetworkId])
  const sellInputId = TradeFormTokenId.sellToken
  const receiveInputId = TradeFormTokenId.receiveToken
  const priceInputId = TradeFormTokenId.price
  const priceInverseInputId = TradeFormTokenId.priceInverse
  const validUntilId = TradeFormTokenId.validUntil

  // Listen on manual changes to URL search query
  const { sell: sellTokenSymbol, buy: receiveTokenSymbol } = useParams()
  const { sellAmount: sellParam, price: priceParam, validUntil: validUntilParam } = useQuery()

  const [sellToken, setSellToken] = useState(
    () => getToken('symbol', sellTokenSymbol, tokens) || (getToken('symbol', 'DAI', tokens) as Required<TokenDetails>),
  )
  const [receiveToken, setReceiveToken] = useState(
    () =>
      getToken('symbol', receiveTokenSymbol, tokens) || (getToken('symbol', 'USDC', tokens) as Required<TokenDetails>),
  )
  const [unlimited, setUnlimited] = useState(!validUntilParam || !Number(validUntilParam))

  const methods = useForm<TradeFormData>({
    mode: 'onChange',
    defaultValues: {
      [sellInputId]: sellParam,
      [receiveInputId]: '',
      [validUntilId]: validUntilParam,
      [priceInputId]: priceParam,
      [priceInverseInputId]: '',
    },
  })
  const { handleSubmit, reset, watch, setValue } = methods

  const priceValue = watch(priceInputId)
  const priceInverseValue = watch(priceInverseInputId)
  const sellValue = watch(sellInputId)

  const receiveValue = watch(receiveInputId)
  const validUntilValue = watch(validUntilId)

  // Update receive amount
  useEffect(() => {
    let receiveAmount: string | undefined
    if (priceValue && sellValue) {
      const sellAmount = parseBigNumber(sellValue)
      const price = parseBigNumber(priceValue)

      if (sellAmount && price) {
        receiveAmount = sellAmount.multipliedBy(price).toString(10)
      }
    }
    setValue(receiveInputId, receiveAmount || '')
  }, [priceValue, priceInverseValue, setValue, receiveInputId, sellValue])

  const searchQuery = buildSearchQuery({
    sell: sellValue,
    price: priceValue,
    expires: validUntilValue,
  })
  const url = `/trade/${sellToken.symbol}-${receiveToken.symbol}?${searchQuery}`
  useURLParams(url, true)

  // TESTING
  const NULL_BALANCE_TOKEN = {
    exchangeBalance: ZERO,
    totalExchangeBalance: ZERO,
    pendingDeposit: { amount: ZERO, batchId: 0 },
    pendingWithdraw: { amount: ZERO, batchId: 0 },
    walletBalance: ZERO,
    claimable: false,
    enabled: false,
    highlighted: false,
    enabling: false,
    claiming: false,
  }

  const { balances } = useTokenBalances()

  const sellTokenBalance = useMemo(
    () => getToken('symbol', sellToken.symbol, balances) || { ...sellToken, ...NULL_BALANCE_TOKEN },
    [NULL_BALANCE_TOKEN, balances, sellToken],
  )

  const receiveTokenBalance = useMemo(
    () => getToken('symbol', receiveToken.symbol, balances) || { ...receiveToken, ...NULL_BALANCE_TOKEN },
    [NULL_BALANCE_TOKEN, balances, receiveToken],
  )

  const { placeOrder, isSubmitting, setIsSubmitting } = usePlaceOrder()
  const history = useHistory()

  const swapTokens = useCallback((): void => {
    setSellToken(receiveToken)
    setReceiveToken(sellToken)
  }, [receiveToken, sellToken])

  const onSelectChangeFactory = useCallback(
    (
      setToken: React.Dispatch<React.SetStateAction<TokenDetails>>,
      oppositeToken: TokenDetails,
    ): ((selected: TokenDetails) => void) => {
      return (selected: TokenDetails): void => {
        if (selected.symbol === oppositeToken.symbol) {
          swapTokens()
        } else {
          setToken(selected)
        }
      }
    },
    [swapTokens],
  )

  const sameToken = sellToken === receiveToken

  async function onSubmit(data: FieldValues): Promise<void> {
    const buyAmount = parseAmount(data[receiveInputId], receiveToken.decimals)
    const sellAmount = parseAmount(data[sellInputId], sellToken.decimals)
    // Minutes - then divided by 5min for batch length to get validity time
    // 0 validUntil time  = unlimited order
    // TODO: review this line
    const validUntil = +data[validUntilId] / 5
    const cachedBuyToken = getToken('symbol', receiveToken.symbol, tokens)
    const cachedSellToken = getToken('symbol', sellToken.symbol, tokens)

    // Do not let potential null values through
    if (!buyAmount || !sellAmount || !cachedBuyToken || !cachedSellToken || !networkId) return

    if (isConnected && userAddress) {
      let pendingTxHash: string | undefined = undefined
      // block form
      setIsSubmitting(true)

      const { success } = await placeOrder({
        buyAmount,
        buyToken: cachedBuyToken,
        sellAmount,
        sellToken: cachedSellToken,
        validUntil,
        txOptionalParams: {
          onSentTransaction: (txHash: string): void => {
            // reset form on successful order placing
            reset(DEFAULT_FORM_STATE)
            setUnlimited(false)
            // unblock form
            setIsSubmitting(false)

            pendingTxHash = txHash
            toast.info(<TxNotification txHash={txHash} />)

            const newTxState = {
              txHash,
              id: 'PENDING ORDER',
              buyTokenId: cachedBuyToken.id,
              sellTokenId: cachedSellToken.id,
              priceNumerator: buyAmount,
              priceDenominator: sellAmount,
              user: userAddress,
              remainingAmount: ZERO,
              sellTokenBalance: ZERO,
              validFrom: 0,
              validUntil: 0,
            }

            return dispatch(savePendingOrdersAction({ orders: newTxState, networkId, userAddress }))
          },
        },
      })
      if (success && pendingTxHash) {
        // remove pending tx
        dispatch(removePendingOrdersAction({ networkId, pendingTxHash, userAddress }))
      }
    } else {
      const from = history.location.pathname + history.location.search
      history.push('/connect-wallet', { from })
    }
  }

  const receiveTokenTooltipText = useMemo(() => _getReceiveTokenTooltipText(sellValue, receiveValue), [
    sellValue,
    receiveValue,
  ])

  return (
    <WrappedWidget>
      <FormContext {...methods}>
        <WrappedForm onSubmit={handleSubmit(onSubmit)}>
          {sameToken && <WarningLabel>Tokens cannot be the same!</WarningLabel>}
          <TokenRow
            selectedToken={sellToken}
            tokens={tokens}
            balance={sellTokenBalance}
            selectLabel="Sell"
            onSelectChange={onSelectChangeFactory(setSellToken, receiveToken)}
            inputId={sellInputId}
            isDisabled={isSubmitting}
            validateMaxAmount
            tabIndex={1}
            readOnly={false}
            tooltipText="Maximum amount of tokens you want to sell"
          />
          <IconWrapper onClick={swapTokens}>
            <img src={switchTokenPair} />
          </IconWrapper>
          <TokenRow
            selectedToken={receiveToken}
            tokens={tokens}
            balance={receiveTokenBalance}
            selectLabel="Receive at least"
            onSelectChange={onSelectChangeFactory(setReceiveToken, sellToken)}
            inputId={receiveInputId}
            isDisabled={isSubmitting}
            tabIndex={2}
            readOnly={true}
            tooltipText={receiveTokenTooltipText}
          />
          <Price
            priceInputId={priceInputId}
            priceInverseInputId={priceInverseInputId}
            sellToken={sellToken}
            receiveToken={receiveToken}
          />
          <OrderValidity
            inputId={validUntilId}
            isDisabled={isSubmitting}
            isUnlimited={unlimited}
            setUnlimited={setUnlimited}
            tabIndex={3}
          />
          <p>This order might be partially filled.</p>
          <SubmitButton
            data-text="This order might be partially filled."
            type="submit"
            disabled={!methods.formState.isValid || isSubmitting}
            tabIndex={5}
          >
            {isSubmitting && <FontAwesomeIcon icon={faSpinner} size="lg" spin={isSubmitting} />}{' '}
            {sameToken ? 'Please select different tokens' : 'Submit limit order'}
          </SubmitButton>
        </WrappedForm>
      </FormContext>
      <OrdersPanel>
        {/* Toggle panel visibility (arrow) */}
        <button />
        {/* Actual orders content */}
        <div>
          <h5>Your orders</h5>
          <OrdersWidget />
        </div>
      </OrdersPanel>
    </WrappedWidget>
  )
}

export default TradeWidget
