import React, { useCallback, useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useQuery } from 'hooks/useQuery'
import { useNetworkId } from 'state/network'
import ActiveSolversTableWidget from 'apps/explorer/components/ActiveSolversTableWidget'
import { TabItemInterface } from 'components/common/Tabs/Tabs'

import { ContentCard as Content, Title } from 'apps/explorer/pages/styled'

import { StyledExplorerTabs, Wrapper } from './styled'

export enum TabView {
  ACTIVE_SOLVERS = 1,
  SETTLEMENTS = 2,
}

const DEFAULT_TAB = TabView[1]

function useQueryViewParams(): { tab: string } {
  const query = useQuery()
  return { tab: query.get('tab')?.toUpperCase() || DEFAULT_TAB } // if URL param empty will be used DEFAULT
}

const tabItems = (networkId: SupportedChainId | undefined): TabItemInterface[] => {
  return [
    {
      id: TabView.ACTIVE_SOLVERS,
      tab: <span>Active Solvers</span>,
      content: <ActiveSolversTableWidget networkId={networkId} />,
    },
    {
      id: TabView.SETTLEMENTS,
      tab: <span>Settlements</span>,
      content: <></>,
    },
  ]
}

const Solver: React.FC = () => {
  const history = useHistory()
  const { tab } = useQueryViewParams()
  const [tabViewSelected, setTabViewSelected] = useState<TabView>(TabView[tab] || TabView[DEFAULT_TAB]) // use DEFAULT when URL param is outside the enum
  const networkId = useNetworkId() || undefined

  const onChangeTab = useCallback((tabId: number) => {
    const newTabViewName = TabView[tabId]
    if (!newTabViewName) return
    setTabViewSelected(TabView[newTabViewName])
  }, [])

  useEffect(() => {
    history.replace({ search: `?tab=${TabView[tabViewSelected].toLowerCase()}` })
  }, [history, tabViewSelected])

  return (
    <Wrapper>
      <Title>Solvers</Title>
      <Content>
        <StyledExplorerTabs
          className={`solvers-tab--${TabView[tabViewSelected].toLowerCase()}`}
          tabItems={tabItems(networkId)}
          defaultTab={tabViewSelected}
          onChange={(key: number): void => onChangeTab(key)}
        />
      </Content>
    </Wrapper>
  )
}

export default Solver
