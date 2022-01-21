const TINIFY_KEY = 'jVLd6VPj66NWsgxwqnGXC03HxF5rgMDt'
const PREFIX = 'https://demo.pagefly.io/pages'
const OPTIMIZE_WIDTH = {
  desktop: 506,
  mobile: 506,
}
const OPTIMIZE_QUALITY = {
  desktop: 80,
  mobile: 80,
}

const VIEWPORT = {
  desktop: {
    width: 1200,
    height: 900,
  },
  mobile: {
    width: 375,
    height: 667,
  },
}

const wsChromeEndpointUrl = 'ws://127.0.0.1:9222/devtools/browser/ba324f93-798d-4ca2-9806-aab8ea704ec6'

module.exports = {
  TINIFY_KEY,
  PREFIX,
  OPTIMIZE_WIDTH,
  OPTIMIZE_QUALITY,
  VIEWPORT,
  wsChromeEndpointUrl
}
