import styled from 'styled-components'
import { media } from 'theme/styles/media'
import { Wrapper as WrapperTemplate } from 'apps/explorer/pages/styled'
import ExplorerTabs from 'apps/explorer/components/common/ExplorerTabs/ExplorerTabs'
import { PaginationWrapper } from 'apps/explorer/components/common/TablePagination'
import { SearchWrapped } from 'components/common/TableSearch/TableSearch'

import { ContentCard } from 'apps/explorer/pages/styled'
import { TabList } from 'components/common/Tabs/Tabs'

export const StyledExplorerTabs = styled(ExplorerTabs)`
  border: 0;
  ${TabList} > button {
    ${media.mobile} {
      font-size: 1.5rem;
      margin: 0;
      display: flex;
      flex-direction: column;
    }
  }
  .tab-extra-content {
    justify-content: center;
    ${media.mobile} {
      form {
        width: 92vw;
        margin-top: 1rem;
      }
    }
  }
`

export const WrapperExtraComponents = styled.div`
  align-items: center;
  display: flex;
  justify-content: flex-end;
  height: 100%;
  gap: 1rem;
  ${media.mediumUp} {
    ${SearchWrapped} {
      width: 35vw;
    }
  }

  ${media.mobile} {
    ${PaginationWrapper} {
      display: none;
    }
    justify-content: center;
  }
`

export const Wrapper = styled(WrapperTemplate)`
  max-width: 118rem;
  ${ContentCard} {
    padding: 0;
    ${media.mobile} {
      border: 0;
    }
  }
  .solvers-tab {
    &--active_solvers,
    &--settlements {
      .tab-content {
        padding: 0;
      }
    }
  }
`
