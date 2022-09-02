import React, { useState, createRef, useCallback, useEffect } from 'react'
import {
  MenuFlyout,
  Content,
  MenuSection,
  MenuTitle,
  MenuContainer,
  Wrapper,
} from 'components/common/MenuDropdown/styled'
import IMAGE_CARRET_DOWN from 'assets/img/carret-down.svg'
import SVG from 'react-inlinesvg'
import { useMediaBreakpoint } from 'hooks/useMediaBreakPoint'
import { ExternalLink } from 'components/analytics/ExternalLink'
import { LinkWithPrefixNetwork } from 'components/common/LinkWithPrefixNetwork'
import useOnClickOutside from 'hooks/useOnClickOutside'
import MobileMenuIcon from 'components/common/MenuDropdown/MobileMenuIcon'
import { addBodyClass, removeBodyClass } from 'utils/toggleBodyClass'

export interface MenuProps {
  title: string
  children: React.ReactNode
  isMobileMenuOpen?: boolean
  showDropdown?: boolean
  url?: string
}

export function MenuItemsPanel({ title, children, showDropdown, url = '' }: MenuProps): JSX.Element {
  const isLargeAndUp = useMediaBreakpoint(['lg'])
  const node = createRef<HTMLOListElement>()
  const [showMenu, setShowMenu] = useState(false)

  const handleOnClick = (): void => {
    setShowMenu((showMenu) => !showMenu)
  }

  useOnClickOutside(node, () => isLargeAndUp && setShowMenu(false)) // only trigger on large screens

  return (
    <MenuFlyout ref={node as never}>
      {showDropdown ? (
        <button onClick={handleOnClick} className={showMenu ? 'expanded' : ''}>
          {title} <SVG src={IMAGE_CARRET_DOWN} description="dropdown icon" className={showMenu ? 'expanded' : ''} />
        </button>
      ) : (
        url && <LinkWithPrefixNetwork to={`${url}`}>{title}</LinkWithPrefixNetwork>
      )}
      {showMenu && <Content onClick={handleOnClick}>{children}</Content>}
    </MenuFlyout>
  )
}

/* type MenuItemKind = 'DROP_DOWN' | 'EXTERNAL_LINK' */

export interface BasicMenuLink {
  title: string
  url: string
  icon?: JSX.Element // If icon uses a regular <img /> tag
  iconSVG?: string // If icon is a <SVG> inline component
}
export interface DropDownSubItem {
  sectionTitle?: string
  links: MenuLink[]
}

export interface DropDownItem {
  kind: string
  title: string
  items: DropDownSubItem[]
  url?: string
}

interface DropdownProps {
  menuContent: DropDownItem[]
}

function Link({ link }: { link: MenuLink }): JSX.Element {
  return (
    <ExternalLink target={'_blank'} href={link.url}>
      {link.title}
    </ExternalLink>
  )
}

export type MenuLink = BasicMenuLink

export const DropDown = ({ menuContent }: DropdownProps): JSX.Element => {
  // const { title, items } = menuContent
  const isUpToLarge = useMediaBreakpoint(['xs', 'sm'])
  const [isOrdersPanelOpen] = useState<boolean>(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const handleMobileMenuOnClick = useCallback(() => {
    isUpToLarge && setIsMobileMenuOpen(!isMobileMenuOpen)
  }, [isUpToLarge, isMobileMenuOpen])
  // Toggle the 'noScroll' class on body, whenever the mobile menu or orders panel is open.
  // This removes the inner scrollbar on the page body, to prevent showing double scrollbars.
  useEffect(() => {
    isMobileMenuOpen || isOrdersPanelOpen ? addBodyClass('noScroll') : removeBodyClass('noScroll')
  }, [isOrdersPanelOpen, isMobileMenuOpen, isUpToLarge])

  return (
    <Wrapper isMobileMenuOpen={isMobileMenuOpen}>
      {isUpToLarge && <MobileMenuIcon isMobileMenuOpen={isMobileMenuOpen} onClick={handleMobileMenuOnClick} />}
      <MenuContainer className={isMobileMenuOpen ? 'mobile-menu' : ''}>
        {(isMobileMenuOpen || !isUpToLarge) &&
          menuContent.map((menu) => (
            <MenuItemsPanel
              title={menu.title}
              key={menu.title}
              showDropdown={menu.kind === 'DROP_DOWN'}
              isMobileMenuOpen={isMobileMenuOpen}
              url={menu.url}
            >
              {menu.items.map((item, index) => {
                const { sectionTitle, links } = item
                return (
                  <MenuSection key={index}>
                    {sectionTitle && <MenuTitle>{sectionTitle}</MenuTitle>}
                    {links.map((link, linkIndex) => (
                      <Link key={linkIndex} link={link} />
                    ))}
                  </MenuSection>
                )
              })}
            </MenuItemsPanel>
          ))}
      </MenuContainer>
    </Wrapper>
  )
}

export default DropDown
