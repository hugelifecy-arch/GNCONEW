type EventProperties = Record<string, unknown>

type PosthogLike = {
  init: (projectApiKey: string, options?: Record<string, unknown>) => void
  capture: (eventName: string, properties?: EventProperties) => void
  debug?: () => void
}

declare global {
  interface Window {
    posthog?: PosthogLike
  }
}

function getPosthogClient() {
  if (typeof window === 'undefined') {
    return null
  }

  return window.posthog
}

function hasConsent(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('gnco_cookie_consent') === 'accepted'
}

function doInit() {
  if (typeof window === 'undefined' || !process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return
  }

  if (!window.posthog) {
    const script = document.createElement('script')
    script.async = true
    script.src = 'https://us-assets.i.posthog.com/static/array.js'
    script.onload = () => {
      const posthogClient = getPosthogClient()
      if (!posthogClient) return

      posthogClient.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
        api_host: 'https://app.posthog.com',
        loaded: (loadedPosthog: PosthogLike) => {
          if (process.env.NODE_ENV === 'development') {
            loadedPosthog.debug?.()
          }
        },
      })
    }

    document.head.appendChild(script)
    return
  }

  window.posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: 'https://app.posthog.com',
    loaded: (loadedPosthog: PosthogLike) => {
      if (process.env.NODE_ENV === 'development') {
        loadedPosthog.debug?.()
      }
    },
  })
}

export function initAnalytics() {
  if (hasConsent()) {
    doInit()
  }

  // Listen for consent granted after page load
  if (typeof window !== 'undefined') {
    window.addEventListener('gnco_consent_granted', () => {
      doInit()
    })
  }
}

export function track(event: string, properties?: EventProperties) {
  if (!hasConsent()) return
  const posthogClient = getPosthogClient()
  if (!posthogClient) return
  posthogClient.capture(event, properties)
}

// Keep old name as alias for backwards compatibility
export const trackEvent = track
