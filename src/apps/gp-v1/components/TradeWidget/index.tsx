import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { unstable_batchedUpdates as batchUpdateState } from 'react-dom'
import { useForm, useWatch, FormProvider, SubmitHandler } from 'react-hook-form'
import { useParams } from 'react-router'
import { toast } from 'toastify'
import BN from 'bn.js'
import styled from 'styled-components'

import { decodeSymbol } from '@gnosis.pm/dex-js'

// assets
import { SwitcherSVG } from 'assets/img/SVG'

// const, types
import { ZERO } from 'const'
import { PRICE_ESTIMATION_DEBOUNCE_TIME } from 'const'
import { TokenDetails, Network, TokenBalanceDetails } from 'types'

// utils
import { getToken, parseAmount, dateToBatchId, resolverFactory, logDebug, batchIdToDate } from 'utils'
import {
  calculateValidityTimes,
  chooseTokenWithFallback,
  calculateReceiveAmount,
  buildUrl,
  preprocessTokenAddressesToAdd,
} from 'apps/gp-v1/components/TradeWidget/utils'

// api
import { PendingTxObj } from 'api/exchange/ExchangeApi'
import { tokenListApi } from 'apps/gp-v1/api'

// components
import OrdersWidget from 'apps/gp-v1/components/OrdersWidget'
import { TxNotification } from 'components/TxNotification'
import { Spinner } from 'components/common/Spinner'
import Modal from 'components/common/Modal'

// TradeWidget: subcomponents
import {
  WrappedWidget,
  WrappedForm,
  WarningLabel,
  IconWrapper,
  ConfirmationModalWrapper,
  SubmitButton,
  ExpandableOrdersPanel,
  OrdersToggler,
} from './TradeWidget.styled'
import TokensAdder from './TokenAdder'
import TokenRow from 'apps/gp-v1/components/TradeWidget/TokenRow'
import OrderValidity from 'apps/gp-v1/components/TradeWidget/OrderValidity'
import { PriceSuggestionWidget as PriceSuggestions } from 'components/trade/PriceSuggestions'
import Price, { invertPriceFromString } from 'components/trade/Price'

// hooks
import useURLParams from 'hooks/useURLParams'
import { useTokenBalances } from 'hooks/useTokenBalances'
import { useWalletConnection } from 'hooks/useWalletConnection'
import { usePlaceOrder } from 'hooks/usePlaceOrder'
import { useQueryTradeParams } from 'hooks/useQuery'
import { useDebounce } from 'hooks/useDebounce'
import useGlobalState from 'hooks/useGlobalState'
import { useConnectWallet } from 'hooks/useConnectWallet'
import { DevTool } from 'HookFormDevtool'
import { useSubmitTxModal } from 'hooks/useSubmitTxModal'

// Reducers
import { savePendingOrdersAction } from 'state/pendingOrders'
import { updateTradeState, TradeState } from 'state/trade'

// Validation
import validationSchema from 'apps/gp-v1/components/TradeWidget/validationSchema'
import { TxMessage } from 'apps/gp-v1/components/TradeWidget/TxMessage'
import { getMarket } from 'utils/markets'
import { AnyAction } from 'combine-reducers'

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

export type TradeFormTokenId = keyof TradeFormData

export interface TradeFormData {
  sellToken: string
  receiveToken: string
  validFrom: string | null
  validUntil: string | null
  price: string
  priceInverse: string
}

const validationResolver = resolverFactory<TradeFormData>(validationSchema)

export const DEFAULT_FORM_STATE: TradeFormData = {
  sellToken: '0',
  receiveToken: '0',
  price: '0',
  priceInverse: invertPriceFromString('0'),
  // ASAP
  validFrom: null,
  // Do not expire (never)
  validUntil: null,
}

const sellInputId: TradeFormTokenId = 'sellToken'
const receiveInputId: TradeFormTokenId = 'receiveToken'
const priceInputId: TradeFormTokenId = 'price'
const priceInverseInputId: TradeFormTokenId = 'priceInverse'
const validFromId: TradeFormTokenId = 'validFrom'
const validUntilId: TradeFormTokenId = 'validUntil'

// Grab CONFIG tokens
const initialTokenSelection = CONFIG.initialTokenSelection
const { sellToken: initialSellTokenDefault, receiveToken: initialReceiveTokenDefault } = initialTokenSelection

const NoTokens = styled.div`
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 3rem;
  font-weight: bold;
`

const TradeWidgetContainer: React.FC = () => {
  const { networkIdOrDefault, isConnected } = useWalletConnection()

  const [{ trade }, dispatch] = useGlobalState()

  // get all token balances but deprecated
  const { balances, tokens: tokenList } = useTokenBalances({ excludeDeprecated: true })

  // If user is connected, use balances, otherwise get the default list
  const tokens =
    isConnected && balances.length > 0
      ? balances
      : tokenList.length > 0
      ? tokenList
      : tokenListApi.getTokens(networkIdOrDefault)

  // Listen on manual changes to URL search query
  const { sell: encodedSellTokenSymbol, buy: decodeReceiveTokenSymbol } = useParams<{ sell?: string; buy?: string }>()
  const sellTokenSymbol = decodeSymbol(encodedSellTokenSymbol || '')
  const receiveTokenSymbol = decodeSymbol(decodeReceiveTokenSymbol || '')

  const { sellToken: initialSellTokenDefaultNetwork, receiveToken: initialReceiveTokenDefaultNetwork } =
    initialTokenSelection.networks[networkIdOrDefault] || {}

  const sellTokenWithFallback = useMemo(
    (): TokenDetails | undefined =>
      chooseTokenWithFallback({
        token: trade.sellToken,
        tokens,
        tokenSymbolFromUrl: sellTokenSymbol,
        defaultTokenSymbol: initialSellTokenDefaultNetwork || initialSellTokenDefault,
      }),
    [trade.sellToken, tokens, sellTokenSymbol, initialSellTokenDefaultNetwork],
  )

  const buyTokenWithFallback = useMemo(
    (): TokenDetails | undefined =>
      chooseTokenWithFallback({
        token: trade.buyToken,
        tokens,
        tokenSymbolFromUrl: receiveTokenSymbol,
        defaultTokenSymbol: initialReceiveTokenDefaultNetwork || initialReceiveTokenDefault,
      }),
    [trade.buyToken, tokens, receiveTokenSymbol, initialReceiveTokenDefaultNetwork],
  )

  const [sellToken, setSellToken] = useState(sellTokenWithFallback)
  const [receiveToken, setReceiveToken] = useState(buyTokenWithFallback)

  const onTokensAdded = (newTokens: TokenDetails[]): void => {
    const { sellTokenAddress, receiveTokenAddress } = positionedAddedTokens
    const sellToken =
      sellTokenAddress && newTokens.find(({ address }) => sellTokenAddress.toLowerCase() === address.toLowerCase())
    const receiveToken =
      receiveTokenAddress &&
      newTokens.find(({ address }) => receiveTokenAddress.toLowerCase() === address.toLowerCase())

    batchUpdateState(() => {
      if (sellToken) setSellToken(sellToken)
      if (receiveToken) setReceiveToken(receiveToken)
    })
  }

  const { tokenAddressesToAdd, positionedAddedTokens } = useMemo(
    () => {
      const tokenAddressesToAdd = preprocessTokenAddressesToAdd(
        [sellTokenSymbol, receiveTokenSymbol],
        networkIdOrDefault,
      )
      return {
        tokenAddressesToAdd,
        positionedAddedTokens: {
          sellTokenAddress: sellTokenSymbol,
          receiveTokenAddress: receiveTokenSymbol,
        },
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  ) // no deps, so that we only calc once on mount
  if (!sellToken || !receiveToken) {
    return (
      <>
        <TokensAdder
          tokenAddresses={tokenAddressesToAdd}
          networkId={networkIdOrDefault}
          onTokensAdded={onTokensAdded}
        />
        <NoTokens>NO TOKENS FOUND</NoTokens>
      </>
    )
  }

  return (
    <TradeWidget
      sellToken={sellToken}
      receiveToken={receiveToken}
      trade={trade}
      dispatch={dispatch}
      tokens={tokens}
      balances={balances}
      setSellToken={setSellToken}
      setReceiveToken={setReceiveToken}
    />
  )
}

interface TradeWidgetProps {
  trade: TradeState
  dispatch: React.Dispatch<AnyAction>
  sellToken: TokenDetails
  receiveToken: TokenDetails
  tokens: TokenDetails[]
  balances: TokenBalanceDetails[]
  setSellToken: (token: TokenDetails) => void
  setReceiveToken: (token: TokenDetails) => void
}

const TradeWidget: React.FC<TradeWidgetProps> = ({
  trade,
  dispatch,
  sellToken,
  receiveToken,
  tokens,
  balances,
  setSellToken,
  setReceiveToken,
}) => {
  const {
    sellAmount: sellParam,
    price: priceParam,
    validFrom: validFromParam,
    validUntil: validUntilParam,
  } = useQueryTradeParams()

  const { connectWallet } = useConnectWallet()
  const { networkId, networkIdOrDefault, isConnected, userAddress } = useWalletConnection()

  // Combining global state with query params
  const defaultPrice = trade.price || priceParam
  const defaultSellAmount = trade.sellAmount || sellParam
  const defaultValidFrom = calculateValidityTimes(trade.validFrom || validFromParam)
  const defaultValidUntil = calculateValidityTimes(trade.validUntil || validUntilParam)

  const [isPriceInverted, setIsPriceInverted] = useState(false)

  const swapPrices = (): void => setIsPriceInverted((invertedMarket) => !invertedMarket)

  const defaultFormValues: TradeFormData = {
    [sellInputId]: defaultSellAmount,
    [receiveInputId]: '',
    [validFromId]: defaultValidFrom,
    [validUntilId]: defaultValidUntil,
    [priceInputId]: defaultPrice,
    [priceInverseInputId]: invertPriceFromString(defaultPrice),
  }

  const [unlimited, setUnlimited] = useState(!defaultValidUntil || !Number(defaultValidUntil))
  const [asap, setAsap] = useState(!defaultValidFrom || !Number(defaultValidFrom))

  const [ordersVisible, setOrdersVisible] = useState(true)

  const methods = useForm<TradeFormData>({
    mode: 'onChange',
    defaultValues: defaultFormValues,
    resolver: validationResolver,
  })
  const { control, handleSubmit, reset, setValue, trigger } = methods

  const {
    sellToken: sellValue,
    validFrom: validFromValue,
    validUntil: validUntilValue,
    price: priceValue,
    priceInverse: priceInverseValue,
  } = useWatch({
    control,
    defaultValue: defaultFormValues,
  })
  // Avoid querying for a new price at every input change
  const { value: debouncedSellValue } = useDebounce(sellValue, PRICE_ESTIMATION_DEBOUNCE_TIME)

  // Updating global trade state on change
  useEffect(() => {
    dispatch(
      updateTradeState({
        price: priceValue,
        sellAmount: sellValue,
        sellToken: sellToken as Required<TokenDetails>,
        buyToken: receiveToken as Required<TokenDetails>,
        validFrom: validFromValue,
        validUntil: validUntilValue,
      }),
    )
  }, [dispatch, priceValue, sellValue, sellToken, receiveToken, validFromValue, validUntilValue])

  // Get canonical market
  const { baseToken, quoteToken } = useMemo(() => getMarket({ receiveToken, sellToken }), [receiveToken, sellToken])

  // Update receive amount
  useEffect(() => {
    if (priceValue && sellValue) {
      // If price is quoted in sell tokens, we use it, otherwise we use the inverse
      const priceUsedForReceiveAmount = sellToken.address === quoteToken.address ? priceValue : priceInverseValue
      setValue(
        receiveInputId,
        calculateReceiveAmount(priceUsedForReceiveAmount || '0', sellValue, receiveToken.decimals),
      )
    }
  }, [
    isPriceInverted,
    quoteToken.address,
    sellToken.address,
    priceValue,
    priceInverseValue,
    setValue,
    sellValue,
    quoteToken.decimals,
    baseToken.decimals,
    receiveToken.decimals,
  ])

  const url = buildUrl({
    sell: sellValue,
    price: priceValue,
    from: validFromValue,
    expires: validUntilValue,
    sellToken: sellToken,
    buyToken: receiveToken,
  })
  // Updates page URL with parameters from context
  useURLParams(url, true)

  const sellTokenBalance = useMemo(
    () => getToken('symbol', sellToken.symbol, balances) || { ...sellToken, ...NULL_BALANCE_TOKEN },
    [balances, sellToken],
  )

  const receiveTokenBalance = useMemo(
    () => getToken('symbol', receiveToken.symbol, balances) || { ...receiveToken, ...NULL_BALANCE_TOKEN },
    [balances, receiveToken],
  )

  const { placeOrder, placeMultipleOrders, isSubmitting, setIsSubmitting } = usePlaceOrder()

  const resetPrices = useCallback((): void => {
    setValue(priceInputId, '0')
    setValue(priceInverseInputId, '0')
    trigger([priceInputId, priceInverseInputId])
  }, [setValue, trigger])

  const swapTokens = useCallback((): void => {
    setSellToken(receiveTokenBalance)
    setReceiveToken(sellTokenBalance)
    // selected price no longer has meaning, reset and force user pick/insert new one
    resetPrices()
  }, [receiveTokenBalance, resetPrices, sellTokenBalance, setReceiveToken, setSellToken])

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
          // selected price no longer has meaning, reset and force user pick/insert new one
          resetPrices()
        }
      }
    },
    [swapTokens, resetPrices],
  )

  const sameToken = sellToken === receiveToken
  const savePendingTransactionsAndResetForm = useCallback(
    (
      txHash: string,
      {
        buyTokenId,
        sellTokenId,
        priceNumerator,
        priceDenominator,
        networkId,
        userAddress,
        validFromWithBatchId,
        validUntilWithBatchID,
        expiresNever,
      },
      resetStateOptions: TradeFormData = DEFAULT_FORM_STATE,
    ): void => {
      batchUpdateState(() => {
        // reset form on successful order placing
        reset(resetStateOptions)
        setUnlimited(false)
        // unblock form
        setIsSubmitting(false)
      })

      toast.info(<TxNotification txHash={txHash} />)

      const pendingOrder: PendingTxObj = {
        id: String(Date.now()), // Uses a temporal unique id
        buyTokenId,
        sellTokenId,
        priceNumerator,
        priceDenominator,
        user: userAddress,
        remainingAmount: priceDenominator,
        sellTokenBalance: ZERO,
        validFrom: validFromWithBatchId,
        //  when expiresNever == true, validUntilWithBatchID == validFromWithBatchId
        validUntil: expiresNever ? 0 : validUntilWithBatchID,
        txHash,
        isUnlimited: false,
      }

      return dispatch(savePendingOrdersAction({ orders: [pendingOrder], networkId, userAddress }))
    },
    [dispatch, reset, setIsSubmitting],
  )

  const _placeOrder = useCallback(
    async (params: {
      validFrom: number
      validUntil: number
      buyAmount: BN
      buyToken: TokenDetails
      sellAmount: BN
      sellToken: TokenDetails
      networkId: number
      userAddress: string
      price: string
    }) => {
      const { price, validFrom, validUntil, buyAmount, buyToken, sellAmount, sellToken, networkId, userAddress } =
        params

      // block form
      setIsSubmitting(true)

      // TODO: Review this logic. This should be calculated in the same place where we send the tx
      const validFromWithBatchId = validFrom
      const validUntilWithBatchID = validUntil

      const isASAP = validFromWithBatchId === 0
      const isNever = validUntilWithBatchID === 0

      // ASAP ORDER
      if (isASAP) {
        return placeOrder({
          networkId,
          userAddress,
          buyAmount,
          buyToken,
          sellAmount,
          sellToken,
          validUntil,
          txOptionalParams: {
            onSentTransaction: (txHash: string): void => {
              return savePendingTransactionsAndResetForm(
                txHash,
                {
                  buyTokenId: buyToken.id,
                  sellTokenId: sellToken.id,
                  priceNumerator: buyAmount,
                  priceDenominator: sellAmount,
                  networkId,
                  userAddress,
                  sellToken,
                  validFromWithBatchId,
                  validUntilWithBatchID,
                  expiresNever: isNever,
                },
                {
                  ...DEFAULT_FORM_STATE,
                  price,
                  priceInverse: invertPriceFromString(price),
                  validFrom: null,
                  validUntil: isNever ? null : batchIdToDate(validUntilWithBatchID).getTime().toString(),
                },
              )
            },
          },
        })
      } else {
        return placeMultipleOrders({
          networkId,
          userAddress,
          orders: [
            {
              buyAmount,
              buyToken: buyToken.id,
              sellAmount,
              sellToken: sellToken.id,
              validFrom,
              validUntil,
            },
          ],
          txOptionalParams: {
            onSentTransaction: (txHash: string): void => {
              return savePendingTransactionsAndResetForm(
                txHash,
                {
                  buyTokenId: buyToken.id,
                  sellTokenId: sellToken.id,
                  priceNumerator: buyAmount,
                  priceDenominator: sellAmount,
                  networkId,
                  userAddress,
                  validFromWithBatchId,
                  validUntilWithBatchID,
                  expiresNever: isNever,
                },
                {
                  ...DEFAULT_FORM_STATE,
                  price,
                  priceInverse: invertPriceFromString(price),
                  validFrom: batchIdToDate(validFromWithBatchId).getTime().toString(),
                  validUntil: isNever ? null : batchIdToDate(validUntilWithBatchID).getTime().toString(),
                },
              )
            },
          },
        })
      }
    },
    [placeMultipleOrders, placeOrder, savePendingTransactionsAndResetForm, setIsSubmitting],
  )

  async function onSubmit(data: SubmitHandler<TradeFormData>): Promise<void> {
    const buyAmount = parseAmount(data[receiveInputId], receiveToken.decimals)
    const sellAmount = parseAmount(data[sellInputId], sellToken.decimals)
    const price = data[priceInputId]

    // Minutes - then divided by 5min for batch length to get validity time
    // 0 validUntil time  = unlimited order
    // TODO: review this line
    const validFromAsBatch = data[validFromId] ? dateToBatchId(Number(data[validFromId])) : 0
    const validUntilAsBatch = data[validUntilId] ? dateToBatchId(Number(data[validUntilId])) : 0
    const cachedBuyToken = getToken('symbol', receiveToken.symbol, tokens)
    const cachedSellToken = getToken('symbol', sellToken.symbol, tokens)
    try {
      await trigger()
      // Do not let potential null values through
      if (
        !buyAmount ||
        buyAmount.isZero() ||
        !sellAmount ||
        sellAmount.isZero() ||
        !cachedBuyToken ||
        !cachedSellToken
      ) {
        logDebug(
          `Preventing null values on submit: 
        buyAmount:${buyAmount}, sellAmount:${sellAmount}, 
        cachedBuyToken:${cachedBuyToken}, cachedSellToken${cachedSellToken}, 
        networkId:${networkId}`,
        )
        return
      }

      const orderParams = {
        price,
        validFrom: validFromAsBatch,
        validUntil: validUntilAsBatch,
        sellAmount,
        buyAmount,
        sellToken: cachedSellToken,
        buyToken: cachedBuyToken,
      }

      if (isConnected && userAddress && networkId) {
        await _placeOrder({
          ...orderParams,
          networkId,
          userAddress,
        })
      } else {
        // Not connected. Prompt user to connect his wallet
        const walletInfo = await connectWallet()

        // Then place the order if connection was successful
        if (walletInfo && walletInfo.networkId === Network.MAINNET && walletInfo.userAddress) {
          await _placeOrder({
            ...orderParams,
            networkId: walletInfo.networkId,
            userAddress: walletInfo.userAddress,
          })
        }
      }
    } catch (error) {
      console.error('Trade submission error:', error)
      toast.error(error.message)
    }
  }

  const onSelectChangeSellToken = onSelectChangeFactory(setSellToken, receiveTokenBalance)
  const onSelectChangeReceiveToken = onSelectChangeFactory(setReceiveToken, sellTokenBalance)

  const onConfirm = handleSubmit(onSubmit)
  const { toggleModal, modalProps } = useSubmitTxModal({
    onConfirm,
    message: function SubmitModalMessage() {
      return (
        <ConfirmationModalWrapper>
          <TxMessage networkId={networkIdOrDefault} sellToken={sellToken} receiveToken={receiveToken} />
        </ConfirmationModalWrapper>
      )
    },
  })

  return (
    <WrappedWidget className={ordersVisible ? '' : 'expanded'}>
      {/* Toggle Class 'expanded' on WrappedWidget on click of the <OrdersPanel> <button> */}
      <FormProvider {...methods}>
        <WrappedForm onSubmit={(e): void => e.preventDefault()} autoComplete="off" noValidate>
          {sameToken && (
            <>
              <WarningLabel className="warning">Tokens cannot be the same! </WarningLabel>
              <br />
            </>
          )}
          <TokenRow
            autoFocus
            selectedToken={sellToken}
            tokens={tokens}
            balance={sellTokenBalance}
            selectLabel="Sell"
            onSelectChange={onSelectChangeSellToken}
            inputId={sellInputId}
            isDisabled={isSubmitting}
            validateMaxAmount
            tabIndex={1}
            readOnly={false}
            userConnected={!!(userAddress && networkId)}
          />
          <IconWrapper onClick={swapTokens}>
            <SwitcherSVG />
          </IconWrapper>
          <TokenRow
            selectedToken={receiveTokenBalance}
            tokens={tokens}
            balance={receiveTokenBalance}
            selectLabel="Receive at least"
            onSelectChange={onSelectChangeReceiveToken}
            inputId={receiveInputId}
            isDisabled={isSubmitting}
            tabIndex={1}
            readOnly
          />
          <Price
            priceInputId={priceInputId}
            priceInverseInputId={priceInverseInputId}
            baseToken={baseToken}
            quoteToken={quoteToken}
            tabIndex={1}
            onSwapPrices={swapPrices}
            isPriceInverted={isPriceInverted}
          />
          <PriceSuggestions
            // Network
            networkId={networkIdOrDefault}
            // Tokens
            // Canonical market
            baseToken={baseToken}
            quoteToken={quoteToken}
            // Keep original selling pair
            receiveToken={receiveToken}
            sellToken={sellToken}
            // SellAmount // Limit Price
            amount={debouncedSellValue}
            // Limit price needs to be shown as correct quote token
            limitPrice={(sellToken.address === quoteToken.address ? priceValue : priceInverseValue) || '0'}
            // Price inversion
            isPriceInverted={isPriceInverted}
            onSwapPrices={swapPrices}
            // Form inputIDs
            priceInputId={priceInputId}
            priceInverseInputId={priceInverseInputId}
          />
          <OrderValidity
            validFromInputId={validFromId}
            validUntilInputId={validUntilId}
            isDisabled={isSubmitting}
            isAsap={asap}
            isUnlimited={unlimited}
            setAsap={setAsap}
            setUnlimited={setUnlimited}
            tabIndex={1}
          />
          <p>This order might be partially filled.</p>

          <SubmitButton
            data-text="This order might be partially filled."
            type="button"
            disabled={isSubmitting || sameToken}
            tabIndex={1}
            onClick={async (): Promise<void> => {
              const formValid = await trigger()

              if (formValid) toggleModal()
            }}
          >
            {isSubmitting && <Spinner size="lg" spin={isSubmitting} />}{' '}
            {sameToken ? 'Select different tokens' : 'Submit limit order'}
          </SubmitButton>
          <Modal.Modal {...modalProps} />
        </WrappedForm>
      </FormProvider>
      <ExpandableOrdersPanel>
        {/* Toggle panel visibility (arrow) */}
        <OrdersToggler
          type="button"
          onClick={(): void => setOrdersVisible((ordersVisible) => !ordersVisible)}
          $isOpen={ordersVisible}
        />
        {/* Actual orders content */}
        <div className="innerWidgetContainer">
          <h5>Your orders</h5>
          <OrdersWidget displayOnly="regular" />
        </div>
      </ExpandableOrdersPanel>
      {/* React Forms DevTool debugger */}
      {process.env.NODE_ENV === 'development' && <DevTool control={control} />}
    </WrappedWidget>
  )
}

export default TradeWidgetContainer
