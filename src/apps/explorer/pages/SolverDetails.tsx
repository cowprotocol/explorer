import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import { useParams } from 'react-router'
import { Helmet } from 'react-helmet'
import { isAddress } from 'web3-utils'
import { abbreviateString } from 'utils'
import { useGetSettlements } from 'hooks/useGetSettlements'
import { useSolversInfo } from 'hooks/useSolversInfo'
import { useMediaBreakpoint } from 'hooks/useMediaBreakPoint'
import { media } from 'theme/styles/media'

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
import { gql } from '@apollo/client'
import { COW_SDK } from 'const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { UiError } from 'types'

const DESKTOP_TEXT_SIZE = 1.8 // rem
const MOBILE_TEXT_SIZE = 1.65 // rem

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  span:first-child {
    margin: 0 0 0 0.5rem;
  }
`

const StyledCard = styled(Card)`
  ${media.mediumDown} {
    .card-container {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 60px;
    }
  }
  @media (max-width: 600px) {
    .card-container {
      height: auto;
    }
  }
`

const AddressContainer = styled(TitleAddress)`
  margin: 0 0 0 1rem;
`
const SolverInfoContainer = styled.div`
  display: flex;
  align-items: baseline;
`

const TableContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: 6rem;
`
const SolverName = styled.p`
  font-size: 1.6rem;
  margin: 0 0 0 1rem;
`

const SolverDetails: React.FC = () => {
  const { solverAddress } = useParams<{ solverAddress: string }>()
  const networkId = useNetworkId() || undefined
  const solversInfo = useSolversInfo(networkId)
  const solver = useGetSolver(solverAddress, networkId)
  const { settlements, isLoading, error } = useGetSettlements(networkId, [], solverAddress)
  const solverName = solversInfo?.find((solver) => solver.address.toLowerCase() === solverAddress.toLowerCase())?.name
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
          <SolverInfoContainer>
            {solverName && <SolverName>{solverName}</SolverName>}
            <AddressContainer
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
          </SolverInfoContainer>
        </HeaderContainer>
      </FlexContainerVar>
      <CardRow>
        <StyledCard xs={6} sm={3} md={3} lg={3}>
          <CardContent
            variant="double"
            label1="Total trades"
            icon1={<HelpTooltip tooltip="Total trades settled by this solver" />}
            value1={numberFormatter(solver.solver?.numberOfTrades ?? 0)}
            loading={isLoading}
            valueSize={valueTextSize}
          />
        </StyledCard>
        <StyledCard xs={6} sm={3} md={3} lg={3}>
          <CardContent
            variant="double"
            icon1={<HelpTooltip tooltip="Total volume settled by this solver" />}
            label1="Total volume"
            value1={`$${numberFormatter(solver.solver?.solvedAmountUsd ?? 0)}`}
            loading={isLoading}
            valueSize={valueTextSize}
          />
        </StyledCard>
        <StyledCard xs={6} sm={3} md={3} lg={3}>
          <CardContent
            variant="double"
            label1="Total settlements"
            icon1={<HelpTooltip tooltip="Total settlements by this solver" />}
            value1={numberFormatter(solver.solver?.numberOfSettlements ?? 0)}
            loading={isLoading}
            valueSize={valueTextSize}
          />
        </StyledCard>
        <StyledCard xs={6} sm={3} md={3} lg={3}>
          {solver.solver?.isSolver ? (
            <CardContent
              variant="double"
              label1="Active since"
              icon1={<HelpTooltip tooltip="When the solver became active as was able to submit solutions" />}
              value1={
                <DateDisplay date={new Date(solver.solver?.lastIsSolverUpdateTimestamp * 1000)} showIcon={true} />
              }
              loading={isLoading}
              valueSize={valueTextSize}
            />
          ) : solver.solver ? (
            <CardContent
              variant="double"
              label1="Inactive since"
              icon1={<HelpTooltip tooltip="When the solver became inactive and stopped submitting solutions" />}
              value1={
                <DateDisplay date={new Date(solver.solver?.lastIsSolverUpdateTimestamp * 1000)} showIcon={true} />
              }
              loading={isLoading}
              valueSize={valueTextSize}
            />
          ) : null}
        </StyledCard>
      </CardRow>
      <TableContainer>
        <SolverDetailsTableWidget settlements={settlements} isLoading={isLoading} error={error} networkId={networkId} />
      </TableContainer>
    </Wrapper>
  )
}

const GET_SOLVER_QUERY = gql`
  query GetSolver($solverAddress: String!) {
    user(id: $solverAddress) {
      address
      numberOfTrades
      solvedAmountUsd
      numberOfSettlements
      lastIsSolverUpdateTimestamp
      isSolver
    }
  }
`

type Solver = {
  address: string
  numberOfTrades: number
  numberOfSettlements: number
  solvedAmountUsd: number
  lastIsSolverUpdateTimestamp: number
  isSolver: boolean
}

type GetSolverResult = {
  solver?: Solver
  error?: UiError
  isLoading: boolean
}

const useGetSolver = (solverAddress: string, networkId?: SupportedChainId): GetSolverResult => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<UiError>()
  const [solver, setSolver] = useState<Solver>()

  const fetchSolver = useCallback(
    async (solverAddress: string): Promise<void> => {
      setIsLoading(true)
      setSolver(undefined)
      try {
        const response = await COW_SDK.cowSubgraphApi.runQuery<{ user: Solver }>(
          GET_SOLVER_QUERY,
          { solverAddress: solverAddress.toLowerCase() },
          { chainId: networkId },
        )
        if (response) {
          setSolver(response.user)
        }
      } catch (e) {
        const msg = `Failed to fetch solver ${solverAddress}`
        console.error(msg, e)
        setError({ message: msg, type: 'error' })
      } finally {
        setIsLoading(false)
      }
    },
    [networkId],
  )

  useEffect(() => {
    fetchSolver(solverAddress)
  }, [fetchSolver, solverAddress])

  return { solver, error, isLoading }
}

export default SolverDetails
