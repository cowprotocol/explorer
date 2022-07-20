import styled from 'styled-components'
import { ContentCard as Content, Wrapper as WrapperTemplate } from 'apps/explorer/pages/styled'
import { media } from 'theme/styles/media'
import { AppDataWrapper } from 'components/orders/DetailsTable'

export const Wrapper = styled(WrapperTemplate)`
  max-width: 118rem;
  ${Content} {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    .json-formatter {
      line-height: 1.25;
      word-break: break-all;
      overflow: auto;
      border: 1px solid ${({ theme }): string => theme.tableRowBorder};
      padding: 0.75rem;
      background: ${({ theme }): string => theme.tableRowBorder};
      border-radius: 0.5rem;

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
    }
    ${AppDataWrapper} {
      flex: 1;
      align-items: center;
      padding-left: 2rem;
    }
    .appData-hash {
      margin-bottom: 1.5rem;
      span,
      a {
        font-size: 1.3rem;
        line-height: 1.25;
      }
    }
  }
  .metadata-form {
    fieldset {
      padding: 3rem;
    }
    .form-group {
      margin-bottom: 2rem;
    }
    .btn.btn-info {
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      font-weight: ${({ theme }): string => theme.fontBold};
      font-size: 1.5rem;
      margin-bottom: 1rem;
      color: ${({ theme }): string => theme.orange1};
      border: 1px solid ${({ theme }): string => theme.orange1};
      background-color: ${({ theme }): string => theme.orangeOpacity};
      border-radius: 0.4rem;
      padding: 0.8rem 1.5rem;
      transition-duration: 0.2s;
      transition-timing-function: ease-in-out;

      ${media.mobile} {
        margin: 1rem 0 0 0;
      }

      ${media.mediumDown} {
        min-width: 18rem;
      }

      :hover {
        opacity: 0.8;
        color: ${({ theme }): string => theme.white};
        text-decoration: none;
      }
    }
    input[type='text'] {
      height: 5rem;
      flex: 1 1 auto;
      background: ${({ theme }): string => theme.greyOpacity};
      font-weight: ${({ theme }): string => theme.fontMedium};
      font-size: 1.6rem;
      border-radius: 0.6rem;
      line-height: 1;
      display: flex;
      outline: 0;
      appearance: none;
      align-items: center;
      color: ${({ theme }): string => theme.greyShade};
      padding: 1.6rem 1.6rem 1.6rem 5rem;
      box-sizing: border-box;
      border: 0.1rem solid transparent;
      transition: border 0.2s ease-in-out;
      margin-top: 1rem;

      &:focus {
        border: 0.1rem solid ${({ theme }): string => theme.borderPrimary};
      }
    }
  }

  ${media.mediumDown} {
    flex-flow: column wrap;
  }
`
