import React, { useCallback, useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { faCode, faListUl } from '@fortawesome/free-solid-svg-icons'
import { useQuery } from 'hooks/useQuery'
import EncodePage from './EncodePage'
import DecodePage from './DecodePage'
import TabIcon from 'components/common/Tabs/TabIcon'
import { TabItemInterface } from 'components/common/Tabs/Tabs'

import { ContentCard as Content, Title } from 'apps/explorer/pages/styled'
import { FormProps } from './config'

import { StyledExplorerTabs, Wrapper } from './styled'

export enum TabView {
  ENCODE = 1,
  DECODE = 2,
}

export type TabData = {
  encode: { formData: FormProps; options: any }
  decode: { formData: FormProps; options: any }
}

const DEFAULT_TAB = TabView[1]

function useQueryViewParams(): { tab: string } {
  const query = useQuery()
  return { tab: query.get('tab')?.toUpperCase() || DEFAULT_TAB } // if URL param empty will be used DEFAULT
}

const tabItems = (
  tabData: TabData,
  setTabData: React.Dispatch<React.SetStateAction<TabData>>,
  onChangeTab: (tabId: number) => void,
): TabItemInterface[] => {
  return [
    {
      id: TabView.ENCODE,
      tab: <TabIcon title="Encode" iconFontName={faListUl} />,
      content: <EncodePage tabData={tabData} setTabData={setTabData} handleTabChange={onChangeTab} />,
    },
    {
      id: TabView.DECODE,
      tab: <TabIcon title="Decode" iconFontName={faCode} />,
      content: <DecodePage tabData={tabData} setTabData={setTabData} />,
    },
  ]
}

const AppDataPage: React.FC = () => {
  const history = useHistory()
  const { tab } = useQueryViewParams()
  const [tabData, setTabData] = useState<TabData>({
    encode: { formData: {}, options: {} },
    decode: { formData: {}, options: {} },
  })
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
          tabItems={tabItems(tabData, setTabData, onChangeTab)}
          defaultTab={tabViewSelected}
          onChange={(key: number): void => onChangeTab(key)}
        />
      </Content>
    </Wrapper>
  )
}

export default AppDataPage
