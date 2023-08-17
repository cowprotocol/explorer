import styled from 'styled-components'

import { media } from 'theme/styles/media'
import { SimpleTable } from 'components/common/SimpleTable'
import { FlexContainer } from 'apps/explorer/pages/styled'
import { Button, Dialog } from '@material-ui/core'

export const Container = styled(FlexContainer)`
  flex-direction: column;
  align-items: baseline;
`
export const Table = styled(SimpleTable)`
  margin-bottom: 10px;
  > tbody > tr {
    grid-template-columns: 27rem auto;
    padding: 1.4rem 0 1.4rem 1.1rem;
    &:hover {
      background: transparent !important;
    }
    ${media.mediumDown} {
      grid-template-columns: 17rem auto;
      padding: 1.4rem 0;
    }
    &:last-of-type {
      grid-template-columns: auto;
    }
    &.auction {
      grid-template-columns: 27rem auto auto;
      ${media.mediumDown} {
        grid-template-columns: 17rem auto auto;
        padding: 1.4rem 0;
      }
      ${media.mobile} {
        display: flex;
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
      ${media.mobile} {
        width: 100%;
      }

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
    &:hover {
      background: transparent !important;
    }
  }
  > thead {
    ${media.mobile} {
      display: none !important;
    }
  }
  > thead > tr > th:nth-child(-n + 2) {
    font-weight: ${({ theme }): string => theme.fontBold};
    font-size: 1.5rem;
  }
  > thead > tr > th {
    font-weight: ${({ theme }): string => theme.fontBold} !important;
    color: ${({ theme }): string => theme.textPrimary1};
  }

  tr > td {
    .MuiAvatar-circular {
      margin-right: 10px;
      width: 30px;
      height: 30px;
      ${media.mobile} {
        width: 15px;
        height: 15px;
      }
    }
    ${media.mobile} {
      display: grid;
      grid-template-columns: 12rem 1fr;
      width: 100%;
      border-bottom: 0.1rem solid ${({ theme }): string => theme.borderPrimary};
      padding: 20px;
    }
    .mobile {
      ${media.mediumUp} {
        display: none;
      }
    }
    .mediumUp {
      ${media.mobile} {
        display: none;
      }
    }
    span.span-inside-tooltip {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      img {
        padding: 0;
      }
    }
  }
  > tbody > tr.ranking {
    border-bottom: 0;
  }

  overflow: auto;
`
export const DetailsTr = styled.tr`
  grid-template-columns: 1fr !important;
  min-height: 0 !important;
  padding: 1rem 0 !important;

  .MuiCollapse-wrapperInner {
    ${media.mobile} {
      display: none;
    }
    display: grid;
    grid-template-columns: 1fr 1fr !important;
    .calldataBox > div {
      display: grid;
      grid-template-columns: 13rem auto;
      align-content: center;
      align-items: center;
      > div {
        display: flex;
        align-items: center;
        > span {
          margin-left: 4px;
        }
      }
    }
  }

  td {
    padding: 0;
  }
`
export const DetailsTable = styled(SimpleTable)`
  width: auto;
  > thead > tr,
  > tbody > tr {
    grid-template-columns: 1fr 1fr !important;
    display: grid !important;
  }

  > thead > tr {
    padding-bottom: 1rem;
    border-bottom: 0.1rem solid ${({ theme }): string => theme.bg3};
    font-weight: ${({ theme }): string => theme.fontBold};

    }
    > th {
      font-weight: ${({ theme }): string => theme.fontBold};
      color: ${({ theme }): string => theme.textPrimary1};
    }
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
  tr > td.amount span {
    display: flex;
    align-items: center;
    img {
      margin-right: 0.5rem;
    }
  }

`

export const HeaderTitle = styled.span`
  display: none;
  ${media.mobile} {
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
  display: flex;
  align-items: center;
  ${media.mobile} {
    flex-wrap: wrap;
    display: flex;
    align-items: center;
    text-align: left;
  }
`
export const ContentCard = styled.div`
  border: 0.1rem solid ${({ theme }): string => theme.borderPrimary};
  padding: 20px;
  border-radius: 0.4rem;

  display: inline;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  max-width: fit-content;
  ${media.mediumUp} {
    min-height: 23rem;
  }
  ${media.mobile} {
    max-height: 80px !important;
  }
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

export const PricesCard = styled.div`
  border: 0.1rem solid ${({ theme }): string => theme.borderPrimary};
  padding: 20px;
  border-radius: 0.4rem;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  column-gap: 3px;
  row-gap: 10px;
  width: 100%;
  max-height: 100px;
  overflow-y: auto;
  ${media.mobile} {
    grid-template-columns: 1fr !important;
    font-size: 0.95rem;
  }
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
  div {
    display: flex;
    align-items: center;
    align-content: center;
    img {
      margin-right: 4px;
      ${media.mobile} {
        width: 20px;
        height: 20px;
      }
    }
  }
`
export const CalldataCard = styled.div`
  border: 0.1rem solid ${({ theme }): string => theme.borderPrimary};
  padding: 20px;
  border-radius: 0.4rem;
  color: #ffffff;
  width: available;
  display: block;
  line-height: 1.3;
  max-height: 100px;
  overflow-y: auto;
  ${media.mobile} {
    max-height: 300px;
    height: available;
  }
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

export const StyledDialog = styled(Dialog)`
  .MuiDialogTitle-root {
    background-color: ${({ theme }): string => theme.bg1};
    color: ${({ theme }): string => theme.textPrimary1};
    .MuiTypography-root.MuiTypography-h6 {
      font-size: 2rem;
      display: flex;
      .MuiButton-root {
        color: white;
        margin-left: auto;
        font-size: 2rem;
      }
    }
    font-size: ${({ theme }): string => theme.fontSizeDefault};
    font-weight: ${({ theme }): string => theme.fontBold};
  }
  .MuiDialogContent-root {
    background-color: ${({ theme }): string => theme.bg1};
    font-size: 1rem;
    width: 80vw;
    .title {
      color: ${({ theme }): string => theme.textPrimary1};
      font-size: ${({ theme }): string => theme.fontSizeDefault};
      font-weight: ${({ theme }): string => theme.fontBold};
      display: flex;
      margin-bottom: 10px;
    }
    .tab-content > table {
      width: 100% !important;
    }
  }
  ${media.mediumUp} {
    display: none;
  }
`
export const CloseButton = styled(Button)`
  margin-left: auto;
  color: white;
`
