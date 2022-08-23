import React, { useCallback, useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { faCode, faListUl } from '@fortawesome/free-solid-svg-icons'
import { useQuery } from 'hooks/useQuery'
import EncodePage from './EncodePage'
import DecodePage from './DecodePage'
import TabIcon from 'components/common/Tabs/TabIcon'
import { TabItemInterface } from 'components/common/Tabs/Tabs'

import { ContentCard as Content, Title } from 'apps/explorer/pages/styled'
import { StyledExplorerTabs, Wrapper } from './styled'

enum TabView {
  ENCODE = 1,
  DECODE,
}

const DEFAULT_TAB = TabView[1]

function useQueryViewParams(): { tab: string } {
  const query = useQuery()
  return { tab: query.get('tab')?.toUpperCase() || DEFAULT_TAB } // if URL param empty will be used DEFAULT
}

const tabItems = (): TabItemInterface[] => {
  return [
    {
      id: TabView.ENCODE,
      tab: <TabIcon title="Encode" iconFontName={faListUl} />,
      content: <EncodePage />,
    },
    {
      id: TabView.DECODE,
      tab: <TabIcon title="Decode" iconFontName={faCode} />,
      content: <DecodePage />,
    },
  ]
}

const AppDataPage: React.FC = () => {
  const history = useHistory()
  const { tab } = useQueryViewParams()
  const [tabViewSelected, setTabViewSelected] = useState<TabView>(TabView[tab] || TabView[DEFAULT_TAB]) // use DEFAULT when URL param is outside the enum

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
      <Title>AppData Details</Title>
      <Content>
        <StyledExplorerTabs
          className={`appData-tab--${TabView[tabViewSelected].toLowerCase()}`}
          tabItems={tabItems()}
          defaultTab={tabViewSelected}
          onChange={(key: number): void => onChangeTab(key)}
        />
      </Content>
    </Wrapper>
  )
}

export default AppDataPage
