import { loadScript } from './aem.js';
import { getCookie } from './configs.js';
import { states } from './states.js';

const convertStateAbbreviation = (abbr) => (states[abbr] ? states[abbr] : null);

// Create state URL
export const getStateURL = (stateAbbr) => {
  let stateName;
  if (stateAbbr.length === 2) {
    stateName = convertStateAbbreviation(stateAbbr);
  }
  const stateNameFormatted = String(stateName).replace(/\s+/g, '-').toLowerCase();
  return `/store-locations/all-store-locations/${stateNameFormatted}`;
};

// Create store detail URL
export const getStoreURL = (stateAbbr, storeName, overrideUrlKey) => {
  const stateName = getStateURL(stateAbbr);
  const storeSegment = overrideUrlKey ?? String(storeName).replace(/\s+/g, '-').replace(/\./g, '').toLowerCase();
  return `${stateName}/${storeSegment}`;
};

/**
 * Updates the My Store link in the Header based on mystore Cookie value
 * @param {Element} anchorEl The <a> element that is updated with My Store info
 */
export const updateMyStoreLink = (anchorEl) => {
  if (!anchorEl) {
    return;
  }

  const myStoreCookie = getCookie('mystore');
  const anchorTargetAtt = anchorEl?.getAttribute('target');
  anchorEl?.classList.add('header-my-store-link');
  if (myStoreCookie) {
    const myStoreObj = JSON.parse(myStoreCookie);
    anchorEl.textContent = myStoreObj.storeName;
    anchorEl.href = myStoreObj.href;
    anchorEl.setAttribute('title', `${myStoreObj.storeName} store details`);
    anchorEl.dataset.mystoreid = myStoreObj.storeId;
    anchorEl.dataset.mystorename = myStoreObj.storeName;
    if (anchorTargetAtt === '_blank') {
      anchorEl.setAttribute('aria-label', `My Store: ${myStoreObj.storeName} details open in a new tab`);
    } else {
      anchorEl.setAttribute('aria-label', `My Store: ${myStoreObj.storeName}`);
    }
  } else {
    anchorEl.textContent = 'Select Store';
    anchorEl.href = '/store-locations';
    anchorEl.setAttribute('title', 'Select Store');
    if (anchorTargetAtt === '_blank') {
      anchorEl.setAttribute('aria-label', 'Select Store opens in a new tab');
    }
  }
};

// Method to check the domain is Prod or not
export const isProd = () => {
  if (
    window.location.hostname === 'www.havertys.com' ||
    window.location.hostname === 'prod.havertys.com' ||
    window.location.hostname === 'main--hvt-eds--havertys-furniture.aem.live'
  ) {
    return true;
  }
  return false;
};

export const detectDevice = () => {
  const result = {
    mobile: false,
    tablet: false,
    desktop: false,
  };

  result.mobile = window.matchMedia('screen and (max-width: 767px)').matches;
  result.tablet = window.matchMedia('screen and (min-width: 768px) and (max-width: 991px)').matches;
  result.desktop = window.matchMedia('screen and (min-width: 992px)').matches;

  return result;
};

export const getURLParam = (paramName) => {
  const urlParams = new URLSearchParams(window.location.search);

  return urlParams.get(paramName);
};

/* eslint-disable-next-line default-param-last */
export const loadSwiperSetup = (block, selector, breakpointsParams, navigation, otherParams = {}, cb) => {
  const swiperScriptUrl = `${window.hlx.codeBasePath}/scripts/swiper-bundle.min.js`;
  loadScript(swiperScriptUrl, { async: true })
    .then(async () => {
      if (!window.Swiper) {
        await new Promise((resolve) => {
          const interval = setInterval(() => {
            if (window.Swiper) {
              clearInterval(interval);
              resolve();
            }
          }, 200);
        });
      }

      const swiperParams = {
        spaceBetween: otherParams.spaceBetween || 1,
        loop: otherParams.loop || false,
        autoplay: otherParams.autoplay || '',
        effect: otherParams.effect || '',
        slidesPerView: otherParams.slidesPerView || 1,
        speed: otherParams.speed || 600,
        breakpoints: breakpointsParams,
        keyboard: otherParams.keyboard || '',
        navigation: {
          nextEl: navigation.nextEl,
          prevEl: navigation.prevEl,
        },
        pagination: otherParams.paginationAttrs || {
          el: '.swiper-pagination',
        },
        on: otherParams.on || {}, // ✅ Enables Swiper lifecycle hooks
      };

      block.swiper = new window.Swiper(block.querySelector(selector), swiperParams);

      if (typeof cb === 'function') {
        cb(block.swiper);
      }
    })
    .catch((error) => {
      console.error('[Swiper Setup Error]', error);
    });
};

/**
 * Function to identify the AEM environment based on the URL.
 * @returns {string} Environment mode (author or publish)
 */
export const environmentMode = () => {
  if (window.location.hostname.includes('adobeaemcloud')) {
    return 'author';
  }
  return 'publish';
};

/**
 * Function to setting query for CategoriesForProduct.
 * @returns {query}
 */
export const categoryNameQuery = `query CategoriesForProduct($sku: String!){
  products(filter: {sku: {eq: $sku}}) {
    items {
      sku
      categories {
        id
        name
        url_path
      }
    }
   }
}`;

/**
 * Function to check sku pattern is valid or not.
 * @returns {Array}
 */
export const skuMatchesPattern = (sku) => {
  // pattern is x-xxxx-xxxx
  const skuRegEx = /^\d-\d{4}-\d{4}$/;
  return sku.match(skuRegEx);
};

/**
 * Function to get cookie value.
 * @returns {String}
 */

function getCookieValue(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop().split(';').shift();
  }
  return null;
}

/**
 * Function to set token in storage.
 */

export const setSigninTokenInStorage = () => {
  const authToken = getCookieValue('auth_dropin_user_token');

  if (authToken) {
    // Set the cookie
    document.cookie = `cif.userToken=${authToken}; path=/;`;

    // Set the localStorage
    window.localStorage.setItem(
      'M2_VENIA_BROWSER_PERSISTENCE__signin_token',
      JSON.stringify({
        value: `"${authToken}"`,
        timeStored: Date.now(),
        ttl: '3600', // Time-to-live (TTL) in seconds
      }),
    );
  }
};

/** Get Hero Video Element */
export const getDynamciVideoElement = (source, autoplay, background) => {
  // Create video element
  const video = document.createElement('video');
  video.removeAttribute('controls');
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');

  if (autoplay) {
    video.setAttribute('autoplay', '');
  }

  if (background) {
    video.setAttribute('loop', '');
    video.setAttribute('playsinline', '');
    video.addEventListener('canplay', () => {
      video.muted = true;
      if (autoplay) {
        video.play();
      }
    });
  }

  // Add <source> to video
  const sourceEl = document.createElement('source');
  sourceEl.setAttribute('src', source);
  sourceEl.setAttribute('type', `video/${source.split('.').pop()}`);
  video.appendChild(sourceEl);

  // Create wrapper that will be returned
  const wrapper = document.createElement('div');
  wrapper.className = 'hero-video-container hero-video';
  wrapper.appendChild(video);

  // Add play/pause button ===
  const playPauseWrapper = document.createElement('div');
  playPauseWrapper.className = 'hero-video-placeholder-play-pause';

  const button = document.createElement('button');
  button.type = 'button';
  button.title = 'Play/Pause';

  playPauseWrapper.appendChild(button);
  wrapper.appendChild(playPauseWrapper);

  // Add toggle logic
  button.addEventListener('click', () => {
    if (video.paused) {
      video.play();
      button.classList.remove('paused');
    } else {
      video.pause();
      button.classList.add('paused');
    }
  });

  return wrapper;
};

/** Load Hero Video Element */
export const loadHeroVideoEmbed = (block, link, autoplay, background) => {
  if (block.dataset.embedLoaded === 'true') {
    return;
  }

  const videoEl = getDynamciVideoElement(link, autoplay, background);
  block.append(videoEl);
  videoEl.addEventListener(
    'canplay',
    () => {
      block.dataset.embedLoaded = true;
    },
    { once: true },
  );
};

export const renderSimpleProductPrice = (price) => {
  const { regular, final } = price;

  const priceFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: final?.amount?.currency || 'USD',
  });

  const priceDiv = document.createElement('div');
  priceDiv.classList.add('price-range');

  // discount if available
  if (final.amount.value < regular.amount.value) {
    const discountPrice = document.createElement('span');
    discountPrice.classList.add('price-regular');

    discountPrice.textContent = `${priceFormatter.format(final.amount.value)}`;
    priceDiv.appendChild(discountPrice);
  }

  // regular price
  const regularPrice = document.createElement('span');
  regularPrice.classList.add('price-from');
  regularPrice.textContent = `${priceFormatter.format(regular.amount.value)}`;
  priceDiv.appendChild(regularPrice);

  return priceDiv.outerHTML;
};

export const renderProductPrice = (priceRange) => {
  const { maximum, minimum } = priceRange;

  const priceFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: maximum?.final?.amount?.currency || 'USD',
  });

  const price = document.createElement('div');
  price.classList.add('price-range');

  // show discount price if available
  if (
    maximum.final.amount.value < maximum.regular.amount.value ||
    minimum.final.amount.value < minimum.regular.amount.value
  ) {
    const discountPrice = document.createElement('span');
    discountPrice.classList.add('price-regular');

    discountPrice.textContent =
      maximum.final.amount.value === minimum.final.amount.value
        ? `${priceFormatter.format(maximum.final.amount.value)}`
        : `${priceFormatter.format(minimum.final.amount.value)}-${priceFormatter.format(maximum.final.amount.value)}`;

    price.appendChild(discountPrice);
  }

  // regular price
  const regularPrice = document.createElement('span');
  regularPrice.classList.add('price-from');
  regularPrice.textContent =
    maximum.regular.amount.value === minimum.regular.amount.value
      ? `${priceFormatter.format(maximum.regular.amount.value)}`
      : `${priceFormatter.format(minimum.regular.amount.value)}-${priceFormatter.format(maximum.regular.amount.value)}`;
  price.appendChild(regularPrice);

  return price.outerHTML;
};

export const isSiloImage = (image) => {
  const regex = /\d-\d\d\d\d-\d\d\d\d/;
  return regex.test(image);
};
