import React from 'react'

import InternalExternalMenuLink from 'components/common/MenuDropdown/InternalExternalLink'
import { MAIN_MENU } from 'components/common/MenuDropdown/mainMenu'
import { Wrapper } from 'components/common/MenuDropdown/styled'
import { MenuItemKind, MenuTreeItem } from 'components/common/MenuDropdown/types'
import { MenuContainer } from 'components/common/MenuDropdown/styled'
import DropDown from '.'

export interface ContextProps {
  handleMobileMenuOnClick?: () => void
  isMobileMenuOpen: boolean
}
interface MenuItemWithDropDownProps {
  menuItem: MenuTreeItem
  context: ContextProps
}

function MenuItemWithDropDown(props: MenuItemWithDropDownProps): JSX.Element | null {
  const { menuItem, context } = props

  switch (menuItem.kind) {
    case MenuItemKind.DROP_DOWN:
      return <DropDown menuItem={menuItem} context={context} />

    case undefined: // INTERNAL
    case MenuItemKind.EXTERNAL_LINK: // EXTERNAL
      // Render Internal/External links
      return <InternalExternalMenuLink link={menuItem} />
    default:
      return null
  }
}

export interface MenuTreeProps {
  isMobileMenuOpen: boolean
  handleMobileMenuOnClick: () => void
}

export function MenuTree({ isMobileMenuOpen, handleMobileMenuOnClick }: MenuTreeProps): JSX.Element {
  const context = { handleMobileMenuOnClick, isMobileMenuOpen }
  return (
    <Wrapper isMobileMenuOpen={isMobileMenuOpen}>
      <MenuContainer className={isMobileMenuOpen ? 'mobile-menu' : ''}>
        {MAIN_MENU.map((menuItem, index) => (
          <MenuItemWithDropDown key={index} menuItem={menuItem} context={context} />
        ))}
      </MenuContainer>
    </Wrapper>
  )
}
