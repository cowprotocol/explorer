import React, { useState } from 'react'
import styled from 'styled-components'

// Components
import TabItem from 'components/common/Tabs/TabItem'
import TabContent from 'components/common/Tabs/TabContent'

type TabId = number

export interface TabItemInterface {
  readonly tab: React.ReactNode
  readonly content: React.ReactNode
  readonly id: TabId
}

export interface TabTheme {
  readonly activeBg: string
  readonly activeBgAlt: string
  readonly inactiveBg: string
  readonly activeText: string
  readonly inactiveText: string
  readonly activeBorder: string
  readonly inactiveBorder: string
  readonly letterSpacing: string
  readonly fontWeight: string
  readonly fontSize: string
  readonly borderRadius: boolean
}
interface Props {
  readonly tabItems: TabItemInterface[]
  readonly tabTheme: TabTheme
  readonly defaultTab?: TabId
}

const Wrapper = styled.div`
  display: flex;
  flex-flow: column;
  width: 100%;
  height: 100%;
  > div {
    display: flex;
    flex-flow: row nowrap;
    padding: 0;
    justify-content: space-between;
    width: 100%;
  }
`

export const DEFAULT_TAB_THEME: TabTheme = {
  activeBg: 'var(--color-transparent)',
  activeBgAlt: 'initial',
  inactiveBg: 'var(--color-transparent)',
  activeText: 'var(--color-text-primary)',
  inactiveText: 'var(--color-text-secondary2)',
  activeBorder: 'var(--color-text-primary)',
  inactiveBorder: 'none',
  fontSize: 'var(--font-size-default)',
  fontWeight: 'var(--font-weight-normal)',
  letterSpacing: 'initial',
  borderRadius: false,
}

const Tabs: React.FC<Props> = (props) => {
  const { tabTheme = DEFAULT_TAB_THEME, tabItems, defaultTab = 1 } = props

  const [activeTab, setActiveTab] = useState(defaultTab)

  return (
    <Wrapper>
      <div role="tablist" className="tablist">
        {tabItems.map(({ tab, id }) => (
          <TabItem
            key={id}
            id={id}
            tab={tab}
            onTabClick={setActiveTab}
            isActive={activeTab === id}
            tabTheme={tabTheme}
          />
        ))}
      </div>
      <TabContent tabItems={tabItems} activeTab={activeTab} />
    </Wrapper>
  )
}

export default Tabs

export function getTabTheme(tabStyles: Partial<TabTheme> = {}): TabTheme {
  return {
    ...DEFAULT_TAB_THEME,
    ...tabStyles,
  }
}
