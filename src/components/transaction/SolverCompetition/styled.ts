import styled from 'styled-components'

import { media } from 'theme/styles/media'
import { SimpleTable } from 'components/common/SimpleTable'
import { FlexContainer } from 'apps/explorer/pages/styled'

export const Container = styled(FlexContainer)`
  flex-direction: column;
  align-items: baseline;
`
export const Table = styled(SimpleTable)`
  > tbody > tr {
    grid-template-columns: 27rem auto;
    padding: 1.4rem 0 1.4rem 1.1rem;

    ${media.mediumDown} {
      grid-template-columns: 17rem auto;
      padding: 1.4rem 0;
    }
    &:last-child {
      grid-template-columns: 27rem auto auto;
      ${media.mediumDown} {
        grid-template-columns: 17rem auto auto;
        padding: 1.4rem 0;
      }
      display: grid;
      > td:not(:first-child) {
        flex-direction: column;
        align-items: flex-start;

        .MuiGrid-root {
          width: 100% !important;
          max-width: 100%;
        }
      }
    }
    > td {
      justify-content: flex-start;

      &:first-of-type {
        text-transform: capitalize;
        ${media.mediumUp} {
          font-weight: ${({ theme }): string => theme.fontLighter};
        }

        /* Question mark */
        > svg {
          margin: 0 1rem 0 0;
        }

        /* Column after text on first column */
        ::after {
          content: ':';
        }
      }

      &:last-of-type {
        color: ${({ theme }): string => theme.textPrimary1};
      }

      a.showMoreAnchor {
        font-size: 1.2rem;
        margin-top: 0.5rem;
      }
    }
  }
`

export const SolutionsTable = styled(SimpleTable)`
  > thead > tr,
  > tbody > tr {
    grid-template-columns: 1fr repeat(6, 4fr) 1fr;
  }
  tr > td {
    span.span-inside-tooltip {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      img {
        padding: 0;
      }
    }
  }

  overflow: auto;
`
export const DetailsTr = styled.tr`
  grid-template-columns: 1fr 1fr !important;
  min-height: 0 !important;
  padding: 0 !important;
  td {
    padding: 0;
  }
`
export const DetailsTable = styled(SimpleTable)`
  > thead > tr,
  > tbody > tr {
    grid-template-columns: 1fr 1fr;
  }
  tr > td {
    span.span-inside-tooltip {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      img {
        padding: 0;
      }
    }
  }

  overflow: auto;
`

export const HeaderTitle = styled.span`
  display: none;
  ${media.desktopMediumDown} {
    font-weight: 600;
    align-items: center;
    display: flex;
    margin-right: 3rem;
    svg {
      margin-left: 5px;
    }
  }
`
export const HeaderValue = styled.span`
  ${media.desktopMediumDown} {
    flex-wrap: wrap;
    text-align: end;
  }
`
export const ContentCard = styled.div`
  border: 0.1rem solid ${({ theme }): string => theme.borderPrimary};
  padding: 20px;
  border-radius: 0.4rem;
  min-height: 23rem;
  display: inline;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  max-width: fit-content;
  ::-webkit-scrollbar {
    width: 8px !important;
    height: 8px !important;
  }
  ::-webkit-scrollbar-thumb {
    background: hsla(0, 0%, 100%, 0.1);
    border-radius: 4px;
  }
  ::-webkit-scrollbar-track {
    background-color: rgba(0, 0, 0, 0.2);
  }
`
