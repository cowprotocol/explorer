import styled from 'styled-components'
import { ContentCard as Content, Wrapper as WrapperTemplate } from 'apps/explorer/pages/styled'
import { media } from 'theme/styles/media'
import AppDataWrapper from 'components/common/AppDataWrapper'

export const Wrapper = styled(WrapperTemplate)`
  max-width: 118rem;
  ${Content} {
    display: flex;
    flex-direction: column;

    ${AppDataWrapper} {
      flex: 1;
      align-items: center;
      padding-left: 2rem;
      ${media.mobile} {
        padding-left: 0;
      }
    }
    .json-formatter {
      line-height: 1.25;
      ${media.desktopMediumDown} {
        max-width: 37vw;
      }
      ${media.mediumDownMd} {
        max-width: 33vw;
      }
      ${media.mobile} {
        max-width: none;
      }
    }
    .appData-hash {
      margin-bottom: 1.5rem;
      max-width: 40rem;
      ${media.mobile} {
        max-width: none;
      }
      span,
      a {
        font-size: 1.3rem;
        line-height: 1.3;
      }
    }
    .hidden-content {
      background: ${({ theme }): string => theme.greyOpacity};
      padding: 0 1rem;
      border-radius: 0.5rem;
      font-size: 1.3rem;
      line-height: 1.6;

      ${media.desktop} {
        position: fixed;
        width: 30vw;
      }
      ${media.mediumUp} {
        position: fixed;
        width: 35vw;
      }
      ${media.mobile} {
        margin-top: 1.5rem;
        background: none;
        padding: 0;
        font-size: 1.2rem;
      }
    }
  }

  .form-container {
    display: flex;
    flex: 1;
    p {
      line-height: 1.6rem;
    }

    ${media.mobile} {
      flex-direction: column;
    }
  }
  .ipfs-container {
    display: flex;
    flex-direction: column;
    margin-top: 1rem;
    form {
      input {
        width: 100%;
      }
    }
    p {
      padding-right: 0;
    }
  }
  button {
    &:disabled {
      opacity: 0.3;
      pointer-events: none;
    }
  }
  input[type='text'] {
    height: 5rem;
    flex: 1 1 auto;
    background: ${({ theme }): string => theme.greyOpacity};
    &:read-only {
      cursor: not-allowed;
    }
    font-weight: ${({ theme }): string => theme.fontMedium};
    font-size: 1.6rem;
    border-radius: 0.6rem;
    line-height: 1;
    display: flex;
    outline: 0;
    appearance: none;
    align-items: center;
    color: ${({ theme }): string => theme.greyShade};
    padding: 1.6rem;
    box-sizing: border-box;
    border: 0.1rem solid transparent;
    transition: border 0.2s ease-in-out;
    margin: 0.5rem 0 1rem 0;

    &:focus {
      border: 0.1rem solid ${({ theme }): string => theme.borderPrimary};
    }
  }
  .btn.btn-info {
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    font-weight: ${({ theme }): string => theme.fontBold};
    font-size: 1.5rem;
    margin-bottom: 1rem;
    width: 100%;
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

    :hover {
      opacity: 0.8;
      color: ${({ theme }): string => theme.white};
      text-decoration: none;
    }
  }
  .data-form {
    fieldset {
      padding: 0.6rem 1rem;
      border-radius: 0.6rem;
      border: 1px solid ${({ theme }): string => theme.borderPrimary};
      legend {
        padding: 0.5rem;
      }
    }
    .form-group {
      margin-bottom: 1rem;
      .title-container {
        display: flex;
        align-items: center;
      }
      max-width: 40rem;
      ${media.mobile} {
        max-width: 100%;
      }
    }
    .field-description {
      font-size: 1.3rem;
    }
    .error-detail {
      padding: 0;
      li {
        list-style: none;
        color: ${({ theme }): string => theme.red1};
        font-size: 1.3rem;
      }
    }
  }

  ${media.mediumDown} {
    flex-flow: column wrap;
  }
`
export const IpfsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 40rem;
  ${media.mobile} {
    width: 100%;
  }
  button {
    margin: 1rem 0;
  }
`
