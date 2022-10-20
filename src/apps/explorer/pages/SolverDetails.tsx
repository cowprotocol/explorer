import React from 'react'
import styled from 'styled-components'
import BigNumber from 'bignumber.js'
import { useParams } from 'react-router'
import { Helmet } from 'react-helmet'
import { isAddress } from 'web3-utils'
import { abbreviateString, formatPrice } from 'utils'
import { useGetSettlements } from 'hooks/useGetSettlements'
import { useSolversInfo } from 'hooks/useSolversInfo'
import { useMediaBreakpoint } from 'hooks/useMediaBreakPoint'

import RedirectToSearch from 'components/RedirectToSearch'
import { Card, CardContent } from 'components/common/Card'
import { CardRow } from 'components/common/CardRow'
import { DateDisplay } from 'components/common/DateDisplay'
import { BlockExplorerLink } from 'components/common/BlockExplorerLink'
import Identicon from 'components/common/Identicon'
import { HelpTooltip } from 'components/Tooltip'
import { Wrapper, FlexContainerVar, TitleAddress } from 'apps/explorer/pages/styled'
import SolverDetailsTableWidget from 'apps/explorer/components/SolverDetailsTableWidget'
import { numberFormatter } from 'apps/explorer/components/SummaryCardsWidget/utils'
import { APP_TITLE } from 'apps/explorer/const'
import { useNetworkId } from 'state/network'

const DESKTOP_TEXT_SIZE = 1.8 // rem
const MOBILE_TEXT_SIZE = 1.65 // rem

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  span {
    margin: 0;
  }
`

const TableContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: 6rem;
`
const SolverName = styled.p`
  font-size: 1.6rem;
  margin: 0 2rem 0 1rem;
`

const SolverDetails: React.FC = () => {
  const { solverAddress } = useParams<{ solverAddress: string }>()
  const networkId = useNetworkId() || undefined
  const solversInfo = useSolversInfo(networkId)
  const { settlements, isLoading, error } = useGetSettlements(networkId, [], solverAddress)
  const solverName = solversInfo?.find((solver) => solver.address === solverAddress)?.name
  const totalVolumeUSD = settlements.reduce((acc, settlement) => acc + settlement.totalVolumeUsd, 0)
  const isDesktop = useMediaBreakpoint(['xl', 'lg'])
  const valueTextSize = isDesktop ? DESKTOP_TEXT_SIZE : MOBILE_TEXT_SIZE

  if (!isAddress(solverAddress.toLowerCase())) {
    return <RedirectToSearch from="solvers" />
  }

  return (
    <Wrapper>
      <Helmet>
        <title>Solver Details - {APP_TITLE}</title>
      </Helmet>
      <h1>Solver Details</h1>
      <FlexContainerVar>
        <HeaderContainer>
          <Identicon address={solverAddress} size="md" />
          {solverName && <SolverName>{solverName}</SolverName>}
          <TitleAddress
            textToCopy={solverAddress}
            contentsToDisplay={
              <BlockExplorerLink
                showLogo
                type="address"
                networkId={networkId}
                identifier={solverAddress}
                label={abbreviateString(solverAddress, 6, 4)}
              />
            }
          />
        </HeaderContainer>
      </FlexContainerVar>
      <CardRow>
        <Card xs={6} sm={3} md={3} lg={3}>
          <CardContent
            variant="double"
            label1="Trades"
            icon1={<HelpTooltip tooltip={settlements[0]?.solver.numberOfTrades.toLocaleString()} />}
            value1={numberFormatter(settlements[0]?.solver.numberOfTrades)}
            loading={isLoading}
            valueSize={valueTextSize}
          />
        </Card>
        <Card xs={6} sm={3} md={3} lg={3}>
          <CardContent
            variant="double"
            icon1={
              <HelpTooltip
                tooltip={`$${formatPrice({ price: new BigNumber(totalVolumeUSD), decimals: 2, thousands: true })}`}
              />
            }
            label1="Total volume"
            value1={`$${Number(totalVolumeUSD) ? numberFormatter(totalVolumeUSD) : 0}`}
            loading={isLoading}
            valueSize={valueTextSize}
          />
        </Card>
        <Card xs={6} sm={3} md={3} lg={3}>
          <CardContent
            variant="double"
            label1="Total settlements"
            icon1={<HelpTooltip tooltip={settlements.length.toLocaleString()} />}
            value1={numberFormatter(settlements.length)}
            loading={isLoading}
            valueSize={valueTextSize}
          />
        </Card>
        <Card xs={6} sm={3} md={3} lg={3}>
          <CardContent
            variant="double"
            label1="Active since"
            icon1={<HelpTooltip tooltip={new Date().toISOString()} />}
            value1={<DateDisplay date={new Date()} showIcon={true} />}
            loading={isLoading}
            valueSize={valueTextSize}
          />
        </Card>
      </CardRow>
      <TableContainer>
        <SolverDetailsTableWidget settlements={settlements} isLoading={isLoading} error={error} networkId={networkId} />
      </TableContainer>
    </Wrapper>
  )
}

export default SolverDetails
