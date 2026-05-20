/* eslint-disable no-underscore-dangle */

import { getCookie } from 'scripts/configs.js';

const getQueryParamValue = (key) => {
  const queryParams = new URLSearchParams(window.location.search);
  if (queryParams.has(key)) {
    return encodeURIComponent(queryParams.get(key));
  }
  return null;
};

const getCIDValues = () => {
  if (window.location.href.toUpperCase().includes('CID')) {
    const url = decodeURI(window.location.href.toUpperCase());
    const values = url.split('CID=')[1]?.split('&')[0]?.split('|');
    return values || [];
  }

  return [];
};

// Adobe Launch Data Elements.
const DataElementsJS = {
  get: (key) => {
    window.adobeDataLayer = window.adobeDataLayer || [];

    if (window._satellite) {
      const value = window._satellite.getVar(key);
      if (value) {
        return value;
      }
    }

    if (key in DataElementsJS && typeof DataElementsJS[key] === 'function') {
      return DataElementsJS[key]();
    }

    return null;
  },
  adContent: () => {
    const values = getCIDValues();
    return values.length > 3 ? values[3].toLowerCase() : null;
  },
  'Akamai Test Name': () => getCookie('hvt_ab'),
  deviceType: () => {
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    const mobileSize = viewportWidth < 1200;
    if (navigator.maxTouchPoints || 'ontouchstart' in document.documentElement) {
      if (mobileSize) {
        return 'mobile';
      }
    }

    return 'desktop';
  },
  downloadLinkUrl: () => window.adobeDataLayer.getState()?.linkDetails?.downloadLinkUrl,
  entryURL: () => {
    const ENTRY_URL_KEY = 'entryURL';
    let entryURL = sessionStorage.getItem(ENTRY_URL_KEY);

    if (entryURL) {
      return entryURL;
    }

    entryURL = window.location.href;
    sessionStorage.setItem(ENTRY_URL_KEY, entryURL);

    return entryURL;
  },
  'Experience Cloud ID': () =>
    sessionStorage.getItem('com.adobe.reactor.dataElements.ECID') ||
    (window.alloy && window.alloy('getIdentity').then((data) => data?.identity?.ECID)) ||
    null,
  hostname: () => window.location.hostname,
  linkLocation: () => window.adobeDataLayer.getState()?.linkDetails?.linkLocation,
  linkName: () => window.adobeDataLayer.getState()?.linkDetails?.linkName,
  linkText: () => window.adobeDataLayer.getState()?.linkDetails?.linkText,
  linkType: () => window.adobeDataLayer.getState()?.linkDetails?.linkType,
  linkUrl: () => window.adobeDataLayer.getState()?.linkDetails?.linkUrl,
  'Next Page Method': () => window.adobeDataLayer.getState()?.linkDetails?.nextPageMethod,
  'Next Page Name': () => window.adobeDataLayer.getState()?.linkDetails?.nextPageName,
  'Next Page URL': () => window.adobeDataLayer.getState()?.linkDetails?.nextPageURL,
  offerCode: () => {
    let apolloCache = localStorage.getItem('apollo-cache-persist');
    if (apolloCache) {
      apolloCache = JSON.parse(apolloCache);
      const cartKey = apolloCache[Object.keys(apolloCache).filter((k) => k.startsWith('Cart:'))];
      if (cartKey && cartKey.applied_coupons !== undefined && cartKey.applied_coupons.length) {
        const offerCode = cartKey.applied_coupons[0].code;
        if (offerCode) {
          return offerCode;
        }
      }
    }
    return '';
  },
  pageName: () => {
    let thisPageName = window.location.pathname.replace(/\//g, '|').slice(1);

    if (!thisPageName || thisPageName === '') {
      thisPageName = 'homepage';
    } else if (document.title.toLowerCase() === 'not found') {
      thisPageName = document.title;
    }

    return thisPageName;
  },
  pageType: () => window.adobeDataLayer.getState().pageContext.pageType,
  previousPageName: () => sessionStorage.getItem('pageName'),
  queryParam: () => {
    const urlFullPath = window.location.href;
    return urlFullPath.split('?')[1];
  },
  referrer: () => document.referrer,
  referringURL: () => window.frames.top.document.referrer,
  signedInFlag: () => {
    let userSignedIn = false;
    const getLocalSigninToken = window.localStorage.getItem('M2_VENIA_BROWSER_PERSISTENCE__signin_token');
    if (getLocalSigninToken) {
      userSignedIn = true;
    }

    if (userSignedIn) {
      return 'signed in';
    }

    return 'guest';
  },

  Source: () => {
    const values = getCIDValues();
    return values.length > 1 ? values[1].toLowerCase() : null;
  },
  Startdate: () => {
    const values = getCIDValues();
    return values.length > 4 ? values[4].toLowerCase() : null;
  },
  subSection1: () => {
    const splitPath = window.location.pathname.split('/');
    return splitPath[1];
  },
  subSection2: () => {
    const splitPath = window.location.pathname.split('/');
    return splitPath[2];
  },
  subSection3: () => {
    const splitPath = window.location.pathname.split('/');
    return splitPath[3];
  },

  subSection4: () => {
    const splitPath = window.location.pathname.split('/');
    return splitPath[4];
  },
  time: () => {
    const dateObj = new Date();
    return `${dateObj.getMonth()}/${dateObj.getDate()}/${dateObj.getFullYear()} ${dateObj.getHours()}:${dateObj.getMinutes()}`;
  },
  url: () => {
    const urlFullPath = window.location.href;
    return urlFullPath.split('#')[0].split('?')[0];
  },
  urlFull: () => window.location.href,
  'UTM - Source Platform': () => getQueryParamValue('utm_source_platform'),
  'UTM - Medium': () => getQueryParamValue('utm_medium'),
  'UTM - Campaign': () => getQueryParamValue('utm_campaign'),
  'UTM - Source': () => getQueryParamValue('utm_source'),
  'UTM - Content': () => getQueryParamValue('utm_content'),
};

window.DataElementsJS = DataElementsJS;

// Adobe Analytics eVars
const eVarsJS = {
  get: (number) => {
    window.adobeDataLayer = window.adobeDataLayer || [];

    if (number in eVarsJS && typeof eVarsJS[number] === 'function') {
      return eVarsJS[number]();
    }

    return null;
  },

  3: () => DataElementsJS.get('subSection1'),
  4: () => DataElementsJS.get('subSection2'),
  5: () => DataElementsJS.get('Source'),
  6: () => DataElementsJS.get('subSection3'),
  7: () => DataElementsJS.get('subSection4'),
  8: () => DataElementsJS.get('pageName'),
  9: () => DataElementsJS.get('previousPageName'),
  10: () => DataElementsJS.get('urlFull'),
  11: () => DataElementsJS.get('url'),
  12: () => DataElementsJS.get('queryParam'),
  13: () => DataElementsJS.get('Experience Cloud ID'),
  14: () => DataElementsJS.get(''),
  15: () => DataElementsJS.get('signedInFlag'),
  16: () => DataElementsJS.get('referringURL'),
  17: () => DataElementsJS.get('deviceType'),
  20: () => DataElementsJS.get('linkText'),
  21: () => DataElementsJS.get('linkUrl'),
  23: () => DataElementsJS.get('adContent'),
  24: () => DataElementsJS.get('Startdate'),
  33: () => DataElementsJS.get('offerCode'),
  50: () => DataElementsJS.get('linkType'),
  51: () => DataElementsJS.get('downloadLinkUrl'),
  54: () => DataElementsJS.get('UTM - Source Platform'),
  55: () => DataElementsJS.get('UTM - Medium'),
  56: () => DataElementsJS.get('UTM - Campaign'),
  57: () => DataElementsJS.get('UTM - Source'),
  58: () => DataElementsJS.get('UTM - Content'),
  67: () => DataElementsJS.get('Akamai Test Name'),
  69: () => DataElementsJS.get('entryURL'),
  71: () => DataElementsJS.get('Next Page Name'),
  72: () => DataElementsJS.get('Next Page Method'),
  73: () => DataElementsJS.get('Next Page URL'),
};

// Adobe Analytics Props
const propsJS = {
  get: (number) => {
    window.adobeDataLayer = window.adobeDataLayer || [];

    if (number in propsJS && typeof propsJS[number] === 'function') {
      return propsJS[number]();
    }

    return null;
  },

  1: () => eVarsJS.get(8),
  2: () => eVarsJS.get(10),
  5: () => eVarsJS.get(10),
  6: () => eVarsJS.get(21),
  10: () => DataElementsJS.get('time'),
};

export { eVarsJS, DataElementsJS, propsJS };
