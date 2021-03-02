import ReactGA, { InitializeOptions } from 'react-ga'
import { isMobile } from 'react-device-detect'
export { pageview as viewPage, event as triggerEvent } from 'react-ga'

function getCustomBrowserType(): string {
  if (isMobile) {
    return 'ethereum' in window ? 'mobileWeb3' : 'mobileRegular'
  } else {
    return 'web3' in window ? 'web3' : 'desktop'
  }
}

interface InitAnalyticsParams {
  trackingCode: string
  options?: InitializeOptions
}

export function initAnalytics(params: InitAnalyticsParams): void {
  const { trackingCode, options } = params
  if (typeof trackingCode === 'string') {
    ReactGA.initialize(trackingCode, options)

    ReactGA.set({
      customBrowserType: getCustomBrowserType(),
    })
  } else {
    ReactGA.initialize('test', { testMode: true, debug: true })
  }

  // Track errors
  window.addEventListener('error', (error) => {
    ReactGA.exception({
      description: `${error.message} @ ${error.filename}:${error.lineno}:${error.colno}`,
      fatal: true,
    })
  })
}
