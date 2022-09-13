import React from 'react'

import InternalExternalMenuLink from 'components/common/MenuDropdown/InternalExternalLink'
import { MAIN_MENU } from 'components/common/MenuDropdown/mainMenu'
import { Wrapper, MenuContainer } from 'components/common/MenuDropdown/styled'
import { MenuItemKind, MenuTreeItem } from 'components/common/MenuDropdown/types'
import DropDown from '.'

interface MenuItemWithDropDownProps {
  menuItem: MenuTreeItem
  context: MenuTreeProps
}

function MenuItemWithDropDown(props: MenuItemWithDropDownProps): JSX.Element | null {
  const { menuItem, context } = props

  switch (menuItem.kind) {
    case MenuItemKind.DROP_DOWN:
      return <DropDown menuItem={menuItem} context={context} />

    case undefined: // INTERNAL
    case MenuItemKind.EXTERNAL_LINK: // EXTERNAL
      // Render Internal/External links
      return <InternalExternalMenuLink link={menuItem} handleMobileMenuOnClick={context.handleMobileMenuOnClick} />
    default:
      return null
  }
}

export interface MenuTreeProps {
  isMobileMenuOpen: boolean
  handleMobileMenuOnClick: () => void
  menuList?: MenuTreeItem[]
}

export function MenuTree(props: MenuTreeProps): JSX.Element {
  const { isMobileMenuOpen, menuList = MAIN_MENU } = props
  return (
    <Wrapper isMobileMenuOpen={isMobileMenuOpen}>
      <MenuContainer className={isMobileMenuOpen ? 'mobile-menu' : ''}>
        {menuList.map((menuItem, index) => (
          <MenuItemWithDropDown key={index} menuItem={menuItem} context={props} />
        ))}
      </MenuContainer>
    </Wrapper>
  )
}
