import React, { useState, createRef } from 'react'
import { MenuFlyout, Content, MenuSection, MenuTitle } from 'components/common/MenuDropdown/styled'
import IMAGE_CARRET_DOWN from 'assets/img/carret-down.svg'
import SVG from 'react-inlinesvg'
import { useMediaBreakpoint } from 'hooks/useMediaBreakPoint'
import useOnClickOutside from 'hooks/useOnClickOutside'
import { DropDownItem, MenuItemKind } from './types'
import InternalExternalMenuLink from './InternalExternalLink'
import { ContextProps } from './MenuTree'

interface MenuProps {
  title: string
  children: React.ReactNode
  isMobileMenuOpen?: boolean
  showDropdown?: boolean
  url?: string
}

export function MenuItemsPanel({ title, children }: MenuProps): JSX.Element {
  const isLargeAndUp = useMediaBreakpoint(['lg', 'xl'])
  const node = createRef<HTMLOListElement>()
  const [showMenu, setShowMenu] = useState(false)

  const handleOnClick = (): void => {
    setShowMenu((showMenu) => !showMenu)
  }

  useOnClickOutside(node, () => isLargeAndUp && setShowMenu(false)) // only trigger on large screens

  return (
    <MenuFlyout ref={node as never}>
      <button onClick={handleOnClick} className={showMenu ? 'expanded' : ''}>
        {title} <SVG src={IMAGE_CARRET_DOWN} description="dropdown icon" className={showMenu ? 'expanded' : ''} />
      </button>
      {showMenu && <Content onClick={handleOnClick}>{children}</Content>}
    </MenuFlyout>
  )
}

export interface DropdownProps {
  menuItem: DropDownItem
  context: ContextProps
}

export const DropDown = ({ menuItem, context }: DropdownProps): JSX.Element => {
  const { isMobileMenuOpen } = context

  return (
    <MenuItemsPanel
      title={menuItem.title}
      key={menuItem.title}
      isMobileMenuOpen={isMobileMenuOpen}
      showDropdown={menuItem.kind === MenuItemKind.DROP_DOWN}
    >
      {menuItem.items.map((item, index) => {
        const { sectionTitle, links } = item
        return (
          <MenuSection key={index}>
            {sectionTitle && <MenuTitle>{sectionTitle}</MenuTitle>}
            {links.map((link, linkIndex) => (
              <InternalExternalMenuLink key={linkIndex} link={link} />
            ))}
          </MenuSection>
        )
      })}
    </MenuItemsPanel>
  )
}

export default DropDown
