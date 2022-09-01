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
import useOnClickOutside from 'hooks/useOnClickOutside'
import MobileMenuIcon from 'components/common/MenuDropdown/MobileMenuIcon'
import { addBodyClass, removeBodyClass } from 'utils/toggleBodyClass'

export interface MenuProps {
  title: string
  children: React.ReactNode
  isMobileMenuOpen?: boolean
  showDropdown: boolean
  url?: string
}

/* interface MenuImageProps {
  title: string
  iconSVG?: string
  icon?: string
}

function MenuImage(props: MenuImageProps) {
  const { title, iconSVG, icon } = props

  if (iconSVG) {
    return <SVG src={iconSVG} description={`${title} icon`} />
  } else if (icon) {
    return <img src={icon} alt={`${title} icon`} />
  } else {
    return null
  }
}

function InternalExternalLink({ link, handleMobileMenuOnClick }: InternalExternalLinkProps) {
  const { kind, title, url, iconSVG, icon } = link
  const menuImage = <MenuImage title={title} icon={icon} iconSVG={iconSVG} />
  const isExternal = kind === MenuItemKind.EXTERNAL_LINK

  if (isExternal) {
    return (
      <ExternalLinkComponent href={url} onClickOptional={handleMobileMenuOnClick}>
        {menuImage}
        {title}
      </ExternalLinkComponent>
    )
  } else {
    return (
      <StyledNavLink exact to={url} onClick={handleMobileMenuOnClick}>
        {menuImage}
        {title}
      </StyledNavLink>
    )
  }
}
 */
export function MenuItemsPanel({
  title,
  children,
  isMobileMenuOpen = false,
  showDropdown,
  url = '',
}: MenuProps): JSX.Element {
  const isLargeAndUp = useMediaBreakpoint(['lg'])
  const node = createRef<HTMLOListElement>()
  const [showMenu, setShowMenu] = useState(false)

  const handleOnClick = (): void => {
    setShowMenu((showMenu) => !showMenu)
  }

  useOnClickOutside(node, () => isLargeAndUp && setShowMenu(false)) // only trigger on large screens

  return (
    <MenuContainer className={isMobileMenuOpen ? 'mobile-menu' : ''}>
      <MenuFlyout ref={node as never}>
        {showDropdown ? (
          <button onClick={handleOnClick} className={showMenu ? 'expanded' : ''}>
            {title} <SVG src={IMAGE_CARRET_DOWN} description="dropdown icon" className={showMenu ? 'expanded' : ''} />
          </button>
        ) : (
          /* {url && <Link link={url} />} */
          console.log(url)
        )}
        {showMenu && <Content onClick={handleOnClick}>{children}</Content>}
      </MenuFlyout>
    </MenuContainer>
  )
}
/* type MenuItemKind = 'DROP_DOWN' | 'EXTERNAL_LINK' */

export interface BasicMenuLink {
  title: string
  url: string
  icon?: string // If icon uses a regular <img /> tag
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
    </Wrapper>
  )
}

export default DropDown
