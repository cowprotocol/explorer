import React, { useState, createRef } from 'react'
import { MenuFlyout, Content, MenuSection, MenuTitle } from './styled'
import IMAGE_CARRET_DOWN from 'assets/img/carret-down.svg'
import SVG from 'react-inlinesvg'
import { useMediaBreakpoint } from 'hooks/useMediaBreakPoint'
import { ExternalLink } from 'components/analytics/ExternalLink'
import useOnClickOutside from 'hooks/useOnClickOutside'

export interface MenuProps {
  title: string
  children: React.ReactNode
}

export function MenuItemsPanel({ title, children }: MenuProps): JSX.Element {
  const isLargeAndUp = useMediaBreakpoint(['lg'])
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
}

interface DropdownProps {
  itemContent: DropDownItem
}

function Link({ link }: { link: MenuLink }): JSX.Element {
  return (
    <ExternalLink target={'_blank'} href={link.url}>
      {link.title}
    </ExternalLink>
  )
}

export type MenuLink = BasicMenuLink

export const DropDown = ({ itemContent }: DropdownProps): JSX.Element => {
  const { title, items } = itemContent

  return (
    <MenuItemsPanel title={title}>
      {items?.map((item, index) => {
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
  )
}

export default DropDown
