import styled from 'styled-components'
import { Wrapper as WrapperTemplate } from 'apps/explorer/pages/styled'
import ExplorerTabs from 'apps/explorer/components/common/ExplorerTabs/ExplorerTabs'
import { ContentCard } from 'apps/explorer/pages/styled'

export const StyledExplorerTabs = styled(ExplorerTabs)`
  margin: 1.6rem auto 0;
`

export const Wrapper = styled(WrapperTemplate)`
  max-width: 118rem;
  ${ContentCard} {
    padding: 0;
    border: 0;
  }
  .solvers-tab {
    &--active_solvers {
      .tab-content {
        padding: 0;
        border: 0;
      }
    }
  }
`
