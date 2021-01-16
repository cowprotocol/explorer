import React from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import ThemeProvider, { StaticGlobalStyle, ThemedGlobalStyle } from 'theme'
export interface Props {
  menu?: React.ReactNode
  navTools?: React.ReactNode
}

export const GenericLayout: React.FC<Props> = ({ children, menu, navTools }) => (
  <div>
    <StaticGlobalStyle />
    <ThemeProvider>
      <ThemedGlobalStyle />
      <Header menu={menu} tools={navTools} />
      {children}
      <Footer />
    </ThemeProvider>
  </div>
)

export default GenericLayout
