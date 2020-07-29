import React, { useEffect, useCallback } from 'react'
import styled from 'styled-components'
import Modali, { useModali } from 'modali'

// assets
import { faChartLine, faMinus, faEraser, faPlus, faRetweet } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

// const, types, utils
import { MEDIA } from 'const'
import { TokenDetails, Network } from 'types'
import { safeTokenName, getNetworkFromId } from '@gnosis.pm/dex-js'

// components
import { DEFAULT_MODAL_OPTIONS, ModalBodyWrapper } from 'components/Modal'
import { Chart } from 'components/OrderBookWidget'
import TokenSelector from 'components/TokenSelector'

// hooks
import useSafeState from 'hooks/useSafeState'
import { useTokenList } from 'hooks/useTokenList'
import { useWalletConnection } from 'hooks/useWalletConnection'

const ViewOrderBookBtn = styled.button`
  margin: 0 0 0 auto;
  text-align: right;
  display: flex;
  align-items: center;

  svg {
    font-size: 1.7rem;
    fill: var(--color-text-active);
    margin-left: 0.5rem;
  }
`

const ModalWrapper = styled(ModalBodyWrapper)`
  display: flex;
  text-align: center;
  height: 100%;
  min-width: 100%;
  width: 100%;
  align-items: center;
  align-content: flex-start;
  flex-flow: row wrap;
  padding: 0;
  justify-content: center;

  > span {
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    margin: 1.6rem 0 1rem;
  }

  > span:first-of-type::after {
    content: '/';
    margin: 0 1rem;

    @media ${MEDIA.mobile} {
      display: none;
    }
  }

  > span:first-of-type > p {
    margin: 0 1rem 0 0;
  }

  > span:last-of-type > p {
    margin: 0 0 0 1rem;
  }

  .amcharts-Sprite-group {
    font-size: 1rem;
  }

  .amcharts-Container .amcharts-Label {
    text-transform: uppercase;
    font-size: 1.2rem;
  }

  .amcharts-ZoomOutButton-group > .amcharts-RoundedRectangle-group {
    fill: var(--color-text-active);
    opacity: 0.6;
    transition: 0.3s ease-in-out;

    &:hover {
      opacity: 1;
    }
  }
`

interface OrderBookBtnProps {
  baseToken: TokenDetails
  quoteToken: TokenDetails
  label?: string
  className?: string
}

function onChangeToken(params: {
  setChangedToken: React.Dispatch<React.SetStateAction<TokenDetails>>
  currentToken: TokenDetails
  newToken: TokenDetails
  setOtherToken: React.Dispatch<React.SetStateAction<TokenDetails>>
  otherToken: TokenDetails
  resetZoom: () => void
}): void {
  const { setChangedToken, currentToken, newToken, setOtherToken, otherToken, resetZoom } = params
  if (newToken.address === otherToken.address) {
    setOtherToken(currentToken)
  }
  setChangedToken(newToken)
  resetZoom()
}

export const OrderBookBtn: React.FC<OrderBookBtnProps> = (props: OrderBookBtnProps) => {
  const { baseToken: baseTokenDefault, quoteToken: quoteTokenDefault, label, className } = props
  const { networkIdOrDefault: networkId } = useWalletConnection()
  // get all tokens
  const tokenList = useTokenList({ networkId })
  const [baseToken, setBaseToken] = useSafeState<TokenDetails>(baseTokenDefault)
  const [quoteToken, setQuoteToken] = useSafeState<TokenDetails>(quoteTokenDefault)
  const [zoomFactor, setZoomFactor] = useSafeState<number>(0)
  const [canZoomIn, setCanZoomIn] = useSafeState(true)
  const [canZoomOut, setCanZoomOut] = useSafeState(true)

  const networkDescription = networkId !== Network.Mainnet ? ` (${getNetworkFromId(networkId)})` : ''

  const zoomIn = useCallback(() => setZoomFactor(zoom => zoom + 0.25), [setZoomFactor])
  const zoomOut = useCallback(() => setZoomFactor(zoom => zoom - 0.25), [setZoomFactor])
  const resetZoom = useCallback(() => {
    setZoomFactor(0)
    setCanZoomIn(true)
    setCanZoomOut(true)
  }, [setCanZoomIn, setCanZoomOut, setZoomFactor])

  // Update if any of the base tokens change
  // TODO: if a base or quote token change, there's a re-render and the state is updated, so this is not needed. No?
  useEffect(() => {
    setBaseToken(baseTokenDefault)
    setQuoteToken(quoteTokenDefault)
    resetZoom()
  }, [baseTokenDefault, quoteTokenDefault, resetZoom, setBaseToken, setQuoteToken])

  const swapTokens = useCallback(() => {
    setBaseToken(quoteToken)
    setQuoteToken(baseToken)
    resetZoom()
  }, [baseToken, quoteToken, resetZoom, setBaseToken, setQuoteToken])

  const [modalHook, toggleModal] = useModali({
    ...DEFAULT_MODAL_OPTIONS,
    onHide: () => {
      // Reset the selection on close
      setBaseToken(baseTokenDefault)
      setQuoteToken(quoteTokenDefault)
    },
    large: true,
    title: `${safeTokenName(baseToken)}-${safeTokenName(quoteToken)} Order book${networkDescription}`,
    message: (
      <ModalWrapper>
        <span>
          <TokenSelector
            tokens={tokenList}
            selected={baseToken}
            onChange={(token): void =>
              onChangeToken({
                setChangedToken: setBaseToken,
                currentToken: baseToken,
                newToken: token,
                setOtherToken: setQuoteToken,
                otherToken: quoteToken,
                resetZoom,
              })
            }
          />
        </span>
        <span>
          <TokenSelector
            tokens={tokenList}
            selected={quoteToken}
            onChange={(token): void =>
              onChangeToken({
                setChangedToken: setQuoteToken,
                currentToken: quoteToken,
                newToken: token,
                setOtherToken: setBaseToken,
                otherToken: baseToken,
                resetZoom,
              })
            }
          />
        </span>
        <span>
          <button type="button" onClick={swapTokens}>
            <FontAwesomeIcon icon={faRetweet} />
          </button>
          <button type="button" onClick={zoomIn} disabled={!canZoomIn}>
            <FontAwesomeIcon icon={faPlus} />
          </button>
          <button type="button" onClick={zoomOut} disabled={!canZoomOut}>
            <FontAwesomeIcon icon={faMinus} />
          </button>
          <button type="button" onClick={resetZoom}>
            <FontAwesomeIcon icon={faEraser} />
          </button>
        </span>
        <Chart
          baseToken={baseToken}
          quoteToken={quoteToken}
          networkId={networkId}
          zoomFactor={zoomFactor}
          setCanZoomIn={setCanZoomIn}
          setCanZoomOut={setCanZoomOut}
        />
      </ModalWrapper>
    ),
    buttons: [
      <>&nbsp;</>,
      <Modali.Button label="Close" key="yes" isStyleDefault onClick={(): void => modalHook.hide()} />,
    ],
  })

  return (
    <>
      <ViewOrderBookBtn className={className} onClick={toggleModal} type="button">
        {label || 'View Order Book'} <FontAwesomeIcon className="chart-icon" icon={faChartLine} />
      </ViewOrderBookBtn>
      <Modali.Modal {...modalHook} />
    </>
  )
}
