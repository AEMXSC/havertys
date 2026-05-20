/* eslint-disable import/no-cycle */
/* eslint-disable no-unused-expressions */
import { events } from '@dropins/tools/event-bus.js';
// eslint-disable-next-line import/no-relative-packages
import { initMartech, martechEager, martechLazy, martechDelayed } from '../plugins/martech/src/index.js';
import {
  decorateBlocks,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
  loadFooter,
  loadHeader,
  sampleRUM,
  getMetadata,
  loadScript,
  preloadFile,
  toCamelCase,
  toClassName,
  readBlockConfig,
  fetchPlaceholders,
  getDynamicMediaSrc,
} from './aem.js';

import initializeDropins from './initializers/index.js';
import { getProductByUrlKey, getUrlKeyFromUrl } from './commerce.js';
import { getConfigValue } from './configs.js';
import AdobeDataLayerJS, { getURLParam } from './adobedatalayer/adobedatalayer-methods.js';
import { DataElementsJS } from './adobedatalayer/adobedatalayer-variables.js';
import sendHvtTag from './hvt-tag.js';

window.EDS = true;
window.isAuthor = window.location.href.includes('author') && window.location.href.includes('adobeaemcloud');

const AUDIENCES = {
  mobile: () => window.innerWidth < 600,
  desktop: () => window.innerWidth >= 600,
  // define your custom audiences here as needed
};
const isConsentGiven = true;

const setupMartech = async () => {
  if (window.jest) {
    return Promise.resolve();
  }

  const datastreamId = await getConfigValue('adobe-datastream-id');
  const orgId = await getConfigValue('adobe-org-id');
  const launchUrl = await getConfigValue('adobe-launch-url');
  if (!datastreamId || !orgId) {
    // eslint-disable-next-line no-console
    console.warn('Adobe Launch datastreamId or orgId not set. Skipping martech initialization.');
  }

  return initMartech(
    {
      datastreamId,
      orgId,
      defaultConsent: 'in',
      targetMigrationEnabled: true,
      clickCollectionEnabled: true, // Disable if double links appear.
      onBeforeEventSend: (payload) => {
        // eslint-disable-next-line no-underscore-dangle
        payload.data.__adobe.target ||= {};
        // eslint-disable-next-line no-underscore-dangle
        payload.data.__adobe.analytics ||= {};

        if (window.isAuthor) {
          delete payload.xdm;
          delete payload.data;
        }
      },
    },
    // The library config
    {
      launchUrls: [launchUrl],
      personalization: !!getMetadata('target') && isConsentGiven,
      shouldProcessEvent: (payload) =>
        !window.isAuthor &&
        [
          'web.webinteraction.linkClicks',
          'linkClick',
          'pageLoad',
          'addToCart',
          'scheduleDeliverySubmit',
          'siteError',
        ].includes(payload.event),
    },
  );
};

const martechLoadedPromise = setupMartech();

// Launch script relies on this isProd variable
globalThis.isProd = // eslint-disable-line no-undef
  window.location.hostname === 'www.havertys.com' ||
  window.location.hostname === 'prod.havertys.com' ||
  window.location.hostname === 'main--hvt-eds--havertys-furniture.aem.live';

// Give current host name so target will work on eds urls.
window.targetGlobalSettings = {
  cookieDomain: window.location.hostname,
};

export function setAuthorDataProps(container, label, name, type, model, filter) {
  if (!container || !window.isAuthor) {
    return;
  }
  container.dataset.aueProp = name;
  container.dataset.aueLabel = label;
  container.dataset.aueType = type;

  if (filter) {
    container.dataset.aueFilter = filter;
  }

  if (model) {
    container.dataset.aueModel = model;
  }
}

/**
 * Gets all the metadata elements that are in the given scope.
 * @param {String} scope The scope/prefix for the metadata
 * @returns an array of HTMLElement nodes that match the given scope
 */
export function getAllMetadata(scope) {
  return [...document.head.querySelectorAll(`meta[property^="${scope}:"],meta[name^="${scope}-"]`)].reduce(
    (res, meta) => {
      const id = toClassName(
        meta.name ? meta.name.substring(scope.length + 1) : meta.getAttribute('property').split(':')[1],
      );
      res[id] = meta.getAttribute('content');
      return res;
    },
    {},
  );
}

// Define an execution context
const pluginContext = {
  getAllMetadata,
  getMetadata,
  loadCSS,
  loadScript,
  sampleRUM,
  toCamelCase,
  toClassName,
};

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) {
      sessionStorage.setItem('fonts-loaded', 'true');
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Returns an object containing key-value pairs of the block configuration,
 * where keys are derived from the first column of each row and values are derived from the second column.
 */
export function readBlockKeyValue(block) {
  if (!block) {
    return {};
  }

  return [...block.children].reduce((result, row) => {
    if (row.children.length >= 2) {
      const key = row.children[0].textContent.trim();
      const value = row.children[1];

      if (key && value) {
        result[key] = value;
      }
    }

    return result;
  }, {});
}

/**
 * Decorates links within the specified container element by setting their "target" attribute to "_blank" either if it is external domain.
 * or the texcontent having {{_blank}}
 * @param {HTMLElement} main - The main container element to search for and decorate links.
 */
export function decorateExternalLinks(main) {
  main.querySelectorAll('a').forEach((a) => {
    const href = a.getAttribute('href');
    if (!href) {
      return;
    }

    if (a.hostname !== window.location.hostname || a.textContent.includes('{{_blank}}')) {
      a.target = '_blank';
      a.title = a.title.replace('{{_blank}}', '');
      a.setAttribute('aria-label', `${a.textContent || a.title} opens in a new tab`);
      a.setAttribute('rel', 'noopener noreferrer');
    }
  });
}

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

let isExpanded = false;
function readMoreClick() {
  const readMoreBtn = document.querySelector('.read-more');
  const readLessBtn = document.querySelector('.read-less');
  const extraContent = document.querySelector('.extra-content');

  const { mobile } = detectDevice();
  // Initially hide the extra content only on mobile devices
  if (mobile && extraContent) {
    extraContent.style.display = 'none';
    // eslint-disable-next-line no-use-before-define
    applyEllipsisToParagraph('.read-more-container');
  }
  // Add event listener to "Read More" button
  if (readMoreBtn && extraContent) {
    readMoreBtn?.addEventListener('click', () => {
      if (mobile) {
        extraContent.style.display = 'block';
        isExpanded = true;
        readMoreBtn.style.display = 'none';
        document.querySelector('p.apply-ellipsis')?.classList.remove('apply-ellipsis');
      }
    });
  }
  // Add event listener to "Read Less" button
  if (readLessBtn && extraContent) {
    readLessBtn?.addEventListener('click', () => {
      if (mobile) {
        extraContent.style.display = 'none';
        isExpanded = false;
        readMoreBtn.style.display = 'block';
        // eslint-disable-next-line no-use-before-define
        applyEllipsisToParagraph('.read-more-container');
      }
    });
  }
  // Prevent content from collapsing during scrolling
  document.addEventListener('scroll', () => {
    if (mobile && isExpanded) {
      extraContent.style.display = 'block';
    }
  });
}

/**
 * Retrieves the dynamic media image element from the specified container.
 * Uses getDynamicMediaSrc for URL construction.
 * @param {HTMLElement} container - The container element that holds the dynamic media image anchor.
 * @param {Object} options - Options for the image (e.g., width, height, quality, sizes, srcset).
 * @returns {HTMLImageElement} The constructed image element.
 */
export function getDynamicMediaImage(
  container,
  {
    width = undefined,
    height = null,
    quality = 85,
    sizes = '100vw',
    srcsetWidths = [320, 480, 768, 1024, 1440, 1920],
  } = {},
) {
  const [imageAnchorContainer, altContainer] = container.children;
  const imageAnchor = imageAnchorContainer.querySelector('a[href]');
  if (!imageAnchor) {
    console.error('No image anchor found in dynamic media image container block');
    return null;
  }

  const baseSrc = imageAnchor.getAttribute('href');
  const title = imageAnchor.getAttribute('title');
  const alt = altContainer ? altContainer?.textContent?.trim() || '' : (title !== baseSrc && title) || '';

  if (!baseSrc) {
    console.error('No image URL found in dynamic media image container block');
    return null;
  }

  // Only call getDynamicMediaSrc if the URL has a file extension
  const hasFileExtension = /\.[a-zA-Z0-9]+$/.test(baseSrc.split('?')[0]);

  const { src, srcset } = hasFileExtension
    ? getDynamicMediaSrc(baseSrc, { width, height, quality, srcsetWidths })
    : { src: baseSrc, srcset: null };

  const img = document.createElement('img');
  img.src = src;
  img.alt = alt;
  img.loading = 'lazy';
  img.decoding = 'async';
  img.sizes = sizes;
  img.width = width || Math.min(...srcsetWidths);

  if (height) {
    img.height = height;
  }

  if (srcset) {
    img.srcset = srcset;
  }

  return img;
}

export function decorateReadMoreLinks(main) {
  main.querySelectorAll('a').forEach((a) => {
    const href = a.getAttribute('href');
    if (href === '#readmore') {
      const readmore = document.createElement('button');
      readmore.classList.add('read-more');
      const readless = document.createElement('button');
      readless.classList.add('read-less');
      readmore.innerHTML = a.innerHTML;
      readless.innerHTML = 'Read Less';
      a.parentElement.append(readmore);
      a.parentElement.parentElement.append(readless);
      a.remove();
    }
  });
  // handle readmore content for mobile
  const { mobile } = detectDevice();
  if (mobile) {
    const readMoreButton = document.querySelector('.read-more');
    if (readMoreButton) {
      const wrapperDiv = document.createElement('div');
      wrapperDiv.classList.add('extra-content');
      let nextElement = readMoreButton.parentElement.nextElementSibling;
      const defaultContentWrapper = document.querySelector('.read-more-container .default-content-wrapper');
      while (nextElement) {
        wrapperDiv.appendChild(nextElement);
        nextElement = readMoreButton.parentElement.nextElementSibling;
      }
      defaultContentWrapper.insertBefore(wrapperDiv, readMoreButton.parentElement.nextElementSibling);
      readMoreClick();
    }
  }
}
// Resize to handle readmore
window.addEventListener('resize', () => {
  const readMoreBtn = document.querySelector('.read-more');
  const extraContent = document.querySelector('.extra-content');
  if (extraContent && readMoreBtn) {
    const { desktop } = detectDevice();
    if (desktop) {
      extraContent.style.display = 'block';
      readMoreBtn.style.display = 'none'; // Hide read more on larger screens
    } else {
      // eslint-disable-next-line no-lonely-if
      if (!isExpanded) {
        extraContent.style.display = 'none';
        readMoreBtn.style.display = 'block';
      }
    }
  }
});

/* handle ellipsis for mobile */
function applyEllipsisToParagraph(containerSelector) {
  const readMoreContainer = document.querySelector(containerSelector);
  if (readMoreContainer) {
    const buttonContainer = readMoreContainer.querySelector('.button-container');
    if (buttonContainer) {
      const findPreviousContentTag = buttonContainer.previousElementSibling;
      if (findPreviousContentTag && findPreviousContentTag.tagName === 'P') {
        findPreviousContentTag.classList.add('apply-ellipsis');
      }
    }
  }
}

function autolinkModals(element) {
  element.addEventListener('click', async (e) => {
    const origin = e.target.closest('a');

    if (origin && origin.href && origin.href.includes('/modals/')) {
      e.preventDefault();
      const { openModal } = await import(`/blocks/modal/modal.js`);
      openModal(origin.href);
    }
  });
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks() {
  try {
    // TODO: add auto block, if needed
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Notifies dropins about the current loading state.
 * @param {string} state The loading state to notify
 */
function notifyUI(event) {
  // skip if the event was already sent
  if (events.lastPayload(`aem/${event}`) === event) {
    return;
  }
  // notify dropins about the current loading state
  const handleEmit = () => events.emit(`aem/${event}`);
  // listen for prerender event
  document.addEventListener('prerenderingchange', handleEmit, { once: true });
  // emit the event immediately
  handleEmit();
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateExternalLinks(main);
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);

  // Apply background images from DA data attributes (DA converts section-metadata to data attrs)
  main.querySelectorAll('.section[data-backgroundimage]').forEach((section) => {
    const bgImg = section.dataset.backgroundimage;
    if (bgImg) {
      section.style.backgroundImage = `url(${bgImg})`;
      section.style.backgroundSize = 'cover';
      section.style.backgroundPosition = 'center center';
    }
  });

  decorateBlocks(main);
}

/**
 * Renders a popup by appending the provided HTML element to the document body,
 * dynamically loading the required CSS and JavaScript module for the popup,
 * and initializing the popup functionality.
 */
const renderPopupHtml = async (html) => {
  if (!(html instanceof HTMLElement)) {
    console.error('Invalid HTML content provided');
    return;
  }
  const [, mod] = await Promise.all([loadCSS(`/blocks/pop-up/pop-up.css`), import(`/blocks/pop-up/pop-up.js`)]);

  document.body.appendChild(html);
  if (mod && typeof mod.default === 'function') {
    await mod.default(html.querySelector('.pop-up'));
  }
};

/**
 * - Retrieves the popup page URL from configuration.
 * - Fetches and parses the HTML content from the URL.
 *   checks if their links match the current page, and if so, hides the parent element and renders the popup.
 */
const fetchPopupHtml = async () => {
  try {
    const url = await getConfigValue('popup-page-url');
    if (!url) {
      return;
    }
    const response = await fetch(url);
    const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
    const mainDivs = doc.querySelectorAll('main>div');
    if (mainDivs?.length > 0) {
      const urlChildIndex = 34;
      await Promise.all(
        Array.from(mainDivs).map(async (el) => {
          if (el.querySelector('.pop-up')?.children) {
            const pageLinks = Array.from(el.querySelector('.pop-up').children)?.slice(urlChildIndex);
            const shouldRenderPopup = pageLinks.some((link) => {
              if (!(link instanceof Element)) {
                return false;
              }

              const [, linkEl, enableChildrenEl] = link.children;
              if (!linkEl) {
                return false;
              }

              const anchor = linkEl.querySelector('a[href]');
              const path = anchor?.getAttribute('href');
              const enableChildrenURLs = enableChildrenEl?.textContent?.trim() === 'true' || false;
              const homepage = window.location.pathname === '/' && path === '/content/havertys-eds/us/en';

              if (path && path !== '') {
                if (enableChildrenURLs) {
                  return window.location.pathname.includes(path) || homepage;
                }

                return window.location.pathname === path || homepage;
              }

              return false;
            });

            if (shouldRenderPopup) {
              el.style.display = 'none';
              await renderPopupHtml(el);
            }
          }
        }),
      );
    }
  } catch (error) {
    console.error('Error fetching HTML content:', error);
  }
};

const getSectionsToLoad = (main) => {
  const sections = main.querySelectorAll('.section');
  const firstSection = sections[0];
  let LCP_SECTION = null;

  // eslint-disable-next-line no-restricted-syntax
  for (const section of sections) {
    const blocks = [...section.querySelectorAll('.block')];
    const validBlocks = blocks.filter(
      (block) => !block.classList.contains('breadcrumb') && !block.classList.contains('back-to-all'),
    );

    // Exit the loop once the first valid section is found
    if (validBlocks.length > 0) {
      LCP_SECTION = section;
      break;
    }
  }

  if (!LCP_SECTION) {
    return [firstSection];
  }

  return LCP_SECTION === firstSection ? [LCP_SECTION] : [firstSection, LCP_SECTION];
};

export const preloadPreact = () => {
  preloadFile(`${window.hlx.codeBasePath}/scripts/__dropins__/tools/chunks/icons/Add.js`);
  preloadFile(`${window.hlx.codeBasePath}/scripts/__dropins__/tools/preact-hooks.js`);
  preloadFile(`${window.hlx.codeBasePath}/scripts/__dropins__/tools/preact.js`);
  preloadFile(`${window.hlx.codeBasePath}/scripts/__dropins__/tools/preact-compat.js`);
  preloadFile(`${window.hlx.codeBasePath}/scripts/preact-utils.js`);
  preloadFile('/scripts/htm.js');
};

export const preloadVideo = () => {
  preloadFile(`${window.hlx.codeBasePath}/components/video/video.js`);
  preloadFile(`${window.hlx.codeBasePath}/scripts/__dropins__/tools/signals.js`);
  preloadFile(`${window.hlx.codeBasePath}/scripts/__dropins__/tools/chunks/deviceUtils.js`);
  preloadFile(`${window.hlx.codeBasePath}/scripts/__dropins__/tools/chunks/image-params-keymap.js`);
  preloadFile(`${window.hlx.codeBasePath}/scripts/__dropins__/tools/preact-jsx-runtime.js`);
};

export const preloadImage = () => {
  preloadFile(`${window.hlx.codeBasePath}/components/image/image.js`);
  preloadFile(`${window.hlx.codeBasePath}/scripts/__dropins__/tools/signals.js`);
  preloadFile(`${window.hlx.codeBasePath}/scripts/__dropins__/tools/chunks/deviceUtils.js`);
  preloadFile(`${window.hlx.codeBasePath}/scripts/__dropins__/tools/chunks/image-params-keymap.js`);
  preloadFile(`${window.hlx.codeBasePath}/scripts/__dropins__/tools/preact-jsx-runtime.js`);
};

const preloadMaps = ({ css, placeholder } = {}) => {
  const { mobile } = detectDevice();
  placeholder &&
    preloadFile(`/icons/maps-placeholder${mobile ? '-mobile' : ''}.webp`, {
      as: 'image',
      crossOrigin: null,
      type: 'image/webp',
    });
  css && loadCSS(`${window.hlx.codeBasePath}/blocks/google-map/google-map.css`);
  preloadFile('/blocks/google-map/maps/api.js');
  preloadFile('/blocks/google-map/maps/default.js');
  preloadFile('/blocks/google-map/GoogleMapsComponent.js');
};

export const preloadFormFields = ({ css } = {}) => {
  css && loadCSS(`${window.hlx.codeBasePath}/components/form-fields/form-fields.css`);
  preloadFile('/scripts/vendor/react-hook-form.js');
  preloadFile(`/components/form-fields/form-fields.js`);
  preloadFile('/scripts/formValidators.js');
};

const insertSkipLink = ({ link, text, className }) => {
  const skipLink = document.createElement('a');
  skipLink.classList.add(className, 'skip-to-link');
  skipLink.setAttribute('tabindex', 0);
  skipLink.href = link;
  skipLink.textContent = text;
  document.body.insertBefore(skipLink, document.body.firstChild);
};

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';

  decorateTemplateAndTheme();

  // Instrument experimentation plugin
  if (
    getMetadata('experiment') ||
    Object.keys(getAllMetadata('campaign')).length ||
    Object.keys(getAllMetadata('audience')).length
  ) {
    // eslint-disable-next-line import/no-relative-packages
    const { loadEager: runEager } = await import('../plugins/experimentation/src/index.js');
    await runEager(document, { audiences: AUDIENCES }, pluginContext);
  }

  await initializeDropins();

  window.adobeDataLayer = window.adobeDataLayer || [];

  let pageType = 'CMS';
  if (document.body.querySelector('main .product-details')) {
    pageType = 'Product';

    // Fetch product from url key as soon as possible.
    const urlKey = getUrlKeyFromUrl();
    window.getProductByURLKeyPromise = Promise.all([getProductByUrlKey(urlKey), fetchPlaceholders()]);

    // Preload dropin files that aren't loaded along with other dropin files.
    preloadPreact();
    preloadImage();
    preloadFile(`${window.hlx.codeBasePath}/scripts/__dropins__/storefront-pdp/chunks/isProductConfigurationValid.js`);
    preloadFile(`${window.hlx.codeBasePath}/scripts/__dropins__/storefront-pdp/chunks/getFetchedProductData.js`);
    preloadFile(`${window.hlx.codeBasePath}/scripts/htm.js`);
    preloadFile(`${window.hlx.codeBasePath}/scripts/__dropins__/storefront-pdp/fragments.js`);
    preloadFile(`${window.hlx.codeBasePath}/scripts/__dropins__/storefront-pdp/api.js`);
    preloadFile(`${window.hlx.codeBasePath}/components/image/image.js`);
    preloadFile(`${window.hlx.codeBasePath}/components/video/video.js`);
    preloadFile(`${window.hlx.codeBasePath}/scripts/__dropins__/tools/chunks/icons/Minus.js`);
    preloadFile(`${window.hlx.codeBasePath}/scripts/__dropins__/tools/chunks/icons/CheckWithCircle.js`);
    preloadFile(`${window.hlx.codeBasePath}/scripts/__dropins__/tools/chunks/icons/WarningWithCircle.js`);
    preloadFile(`${window.hlx.codeBasePath}/scripts/__dropins__/tools/chunks/icons/Date.js`);
    preloadFile(`${window.hlx.codeBasePath}/scripts/__dropins__/tools/chunks/icons/Locker.js`);
    preloadFile(`${window.hlx.codeBasePath}/scripts/__dropins__/tools/chunks/icons/Eye.js`);
    preloadFile(`${window.hlx.codeBasePath}/scripts/__dropins__/tools/chunks/icons/EyeClose.js`);
    preloadFile(`${window.hlx.codeBasePath}/scripts/__dropins__/tools/chunks/icons/Check.js`);
    preloadFile(`${window.hlx.codeBasePath}/scripts/__dropins__/tools/chunks/icons/Close.js`);
    preloadFile(`${window.hlx.codeBasePath}/scripts/__dropins__/tools/chunks/icons/ChevronDown.js`);
    preloadFile(`${window.hlx.codeBasePath}/scripts/__dropins__/tools/chunks/icons/Trash.js`);
    preloadFile(`${window.hlx.codeBasePath}/scripts/__dropins__/tools/lib.js`);
    preloadFile(`${window.hlx.codeBasePath}/scripts/__dropins__/tools/i18n.js`);
    preloadFile(`${window.hlx.codeBasePath}/scripts/__dropins__/tools/components.js`);
    preloadFile(`${window.hlx.codeBasePath}/scripts/__dropins__/tools/chunks/initializer.js`);

    // initialize pdp
    await import('./initializers/pdp.js');
  } else if (document.body.querySelector('main .product-details-custom')) {
    const { getProduct, getSkuFromUrl } = await import('./commerce.js');

    pageType = 'Product';
    preloadPreact();
    preloadFile('/blocks/product-details-custom/ProductDetailsCarousel.js');
    preloadFile('/blocks/product-details-custom/ProductDetailsSidebar.js');
    preloadFile('/blocks/product-details-custom/ProductDetailsShimmer.js');
    preloadFile('/blocks/product-details-custom/Icon.js');

    const blockConfig = readBlockConfig(document.body.querySelector('main .product-details-custom'));
    const sku = getSkuFromUrl() || blockConfig.sku;
    window.getProductPromise = getProduct(sku);
  } else if (document.body.querySelector('main .product-list-page')) {
    pageType = 'Category';
    const [calloutsFragmentEl] = document.body.querySelector('main .product-list-page').children;
    const calloutFragmentPath = calloutsFragmentEl?.textContent?.trim();
    window.calloutsPromise =
      calloutFragmentPath !== '' &&
      fetch(`${calloutFragmentPath}.plain.html`)
        .then((resp) => resp.ok && resp.text())
        .catch((error) => console.error(error));

    preloadFile('/scripts/widgets/search.js');
    preloadFile('/blocks/product-callouts/product-callouts.js');
    preloadFile('/blocks/product-list-page/product-list-page.js');
  } else if (document.body.querySelector('main .product-list-page-custom')) {
    // TODO Remove this bracket if not using custom PLP
    pageType = 'Category';
    const plpBlock = document.body.querySelector('main .product-list-page-custom');
    const { category, urlpath } = readBlockConfig(plpBlock);

    if (category && urlpath) {
      // eslint-disable-next-line import/no-unresolved, import/no-absolute-path
      const { preloadCategory } = await import('/blocks/product-list-page-custom/product-list-page-custom.js');
      preloadCategory({ id: category, urlPath: urlpath });
    }
  } else if (document.body.querySelector('main .commerce-cart')) {
    pageType = 'Cart';
  } else if (document.body.querySelector('main .commerce-checkout')) {
    pageType = 'Checkout';
  } else if (document.body.querySelector('main .store-details')) {
    preloadFile('/blocks/store-details/store-details-schema.js');
    preloadFile(`/scripts/states.js`);
  } else if (document.body.querySelector('main .store-locator')) {
    preloadFormFields({ css: true });
    preloadPreact();
    preloadMaps({ placeholder: true });
    preloadFile('/blocks/google-map/maps/stores/stores-default-map.js');
    preloadFile('/scripts/helper.js');
    preloadFile('/scripts/states.js');
    preloadFile('/scripts/session-zip.js');
    preloadFile('/scripts/stores/MyStore.js');
  } else if (document.body.querySelector('main .make-an-appointment')) {
    pageType = 'Appointment';
    preloadPreact();
    preloadFormFields({ css: true });
    preloadFile('scripts/stores/stores.js');
    preloadFile('scripts/cache.js');
    preloadFile('scripts/states.js');
    preloadFile('scripts/session-zip.js');
    preloadFile('components/find-nearby-stores/useStoreLocations.js');
    preloadFile('components/find-nearby-stores/find-nearby-stores.js');
    preloadFile('blocks/make-an-appointment/useMakeAnAppointment.js');
    preloadFile('blocks/make-an-appointment/make-an-appointment-utils.js');
    preloadFile('blocks/make-an-appointment/make-an-appointment-constants.js');
    preloadFile('blocks/make-an-appointment/MakeAppointmentStoreLocations.js');
    preloadFile('blocks/make-an-appointment/usePreloadComponent.js');
  } else if (document.body.querySelector('main .rescheduled-delivery')) {
    preloadFile('/blocks/rescheduled-delivery/rescheduled-delivery-hooks.js');
    preloadFile('/blocks/rescheduled-delivery/rescheduled-delivery-api.js');
    preloadFile('/blocks/rescheduled-delivery/rescheduled-delivery-errors.js');
    preloadPreact();
  } else if (document.body.querySelector('main .follow-the-truck, main .follow-the-tech')) {
    loadCSS(`${window.hlx.codeBasePath}/components/follow-route/follow-route.css`);
    preloadMaps({ css: true, placeholder: true });
    preloadPreact();
    preloadImage();
    preloadFile('/blocks/google-map/maps/follow-the-route-map.js');
    preloadFile('/scripts/servlet-request.js');
    preloadFile('/scripts/follow.js');
    preloadFile('/components/follow-route/follow-route.js');
    preloadFile('/components/follow-route/follow-route-hooks.js');
    preloadFile('/components/follow-map/follow-map.js');
    preloadFile('/components/person-introduction/person-introduction.js');
    preloadFile('/components/route-time-table/route-time-table.js');
  } else if (document.body.querySelector('main .confirm-service')) {
    import('blocks/confirm-service/confirm-service-preloads.js');
  } else if (document.body.querySelector('main .confirm-delivery')) {
    preloadFormFields({ css: true });
    [
      'styles/split-layout',
      'components/delivery-obstacles/delivery-obstacles',
      'components/thank-you/thank-you',
      'components/tool-tip/tool-tip',
    ].forEach((cssFile) => loadCSS(`${window.hlx.codeBasePath}/${cssFile}.css`));
    preloadPreact();
    preloadVideo();
    [
      '/scripts/formatters',
      '/scripts/servlet-request',
      '/components/delivery-obstacles/delivery-obstacles',
      '/components/special-delivery-instructions/special-delivery-instructions',
      '/components/thank-you/thank-you',
      '/blocks/confirm-delivery/confirm-delivery-api',
      '/blocks/confirm-delivery/confirm-delivery-errors',
      '/blocks/confirm-delivery/confirm-delivery-form',
      '/blocks/confirm-delivery/confirm-delivery-hooks',
      '/blocks/confirm-delivery/confirm-delivery-utils',
      '/blocks/confirm-delivery/confirm-delivery-submit-button',
    ].forEach((file) => preloadFile(`${file}.js`));
  } else if (document.body.querySelector('main  .contact-us')) {
    preloadFormFields({ css: true });
    preloadPreact();

    [
      '/components/thank-you/thank-you',
      '/scripts/servlet-request',
      '/blocks/contact-us/contact-us-api',
      '/blocks/contact-us/contact-us-hooks',
      '/blocks/contact-us/contact-us-errors',
    ].forEach((file) => preloadFile(`${file}.js`));
  } else if (document.body.querySelector('main  .sent-worksheet')) {
    preloadImage();
    preloadFormFields({ css: true });
    preloadPreact();

    [
      '/blocks/sent-worksheet/sent-worksheet-api',
      '/blocks/sent-worksheet/sent-worksheet-hooks',
      '/blocks/sent-worksheet/sent-worksheet-errors',
    ].forEach((file) => preloadFile(`${file}.js`));
  } else if (document.body.querySelector('main  .reset-password')) {
    preloadFormFields({ css: true });
    preloadPreact();

    [
      '/blocks/reset-password/reset-password-api',
      '/blocks/reset-password/reset-password-hooks',
      '/blocks/reset-password/reset-password-errors',
    ].forEach((file) => preloadFile(`${file}.js`));
  } else if (document.body.querySelector('main .schedule-delivery')) {
    import('blocks/schedule-delivery/schedule-delivery-preloads.js');
  } else if (document.body.querySelector('main .pay-now')) {
    import('blocks/pay-now/pay-now-preloads.js');
  } else if (document.body.querySelector('main .schedule-service')) {
    import('blocks/schedule-service/schedule-service-preloads.js');
  }

  window.adobeDataLayer.push(
    {
      pageContext: {
        pageType,
        pageName: DataElementsJS.get('pageName'),
        eventType: 'visibilityHidden',
        maxXOffset: 0,
        maxYOffset: 0,
        minXOffset: 0,
        minYOffset: 0,
      },
      _experienceplatform: {
        identification: {
          core: {
            ecid: sessionStorage.getItem('com.adobe.reactor.dataElements.ECID'),
          },
        },
      },
      web: {
        webPageDetails: {
          URL: window.location.href,
        },
      },
    },
    {
      shoppingCartContext: {
        totalQuantity: 0,
      },
    },
  );

  if (pageType !== 'Product') {
    martechLoadedPromise.then(AdobeDataLayerJS.pageLoad);
  }

  // Push a page-view event with current state into datalayer and for the sensei snowplow event to work.
  window.adobeDataLayer.push((dl) => {
    dl.push({ event: 'page-view', eventInfo: { ...dl.getState() } });
  });

  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    decorateReadMoreLinks(main);

    insertSkipLink({ link: '#main-content', text: 'Skip to main content', className: 'skip-to-main' });
    insertSkipLink({ link: '#openChat', text: 'Skip to chat', className: 'skip-to-chat' });

    main.id = 'main-content';
    document.body.classList.add('appear');

    // Fire HVT Tags for testing analytics.
    if (window.location.pathname === '/') {
      sendHvtTag(120, window.location.pathname);
    }

    const searchTerm = getURLParam('search_query');
    if (window.location.href.includes('/search') && searchTerm) {
      sendHvtTag(123, searchTerm);
    }

    const sectionsToLoad = getSectionsToLoad(main);

    await Promise.allSettled([
      martechLoadedPromise.then(martechEager),
      loadScript(
        `${window.hlx.codeBasePath}/scripts/adobedatalayer/_adobedatalayer.js`,
        {
          type: 'text/javascript',
        },
        { async: true },
      ),
      ...sectionsToLoad.map((section) => loadSection(section, waitForFirstImage)),
      fetchPopupHtml(),
    ]);
  }

  // notify that the page is ready for eager loading
  notifyUI('lcp');

  try {
    await loadHeader(doc.querySelector('header'));

    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  autolinkModals(doc);
  await martechLazy();
  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) {
    element.scrollIntoView();
  }

  const safe = (label, promise) => promise.catch((error) => console.error(`Error in loadLazy -> ${label}: `, error));

  await Promise.all([
    safe('loadFooter', loadFooter(doc.querySelector('body > footer'))),
    safe('loadCSS', loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`)),
    safe('loadFonts', loadFonts()),
    safe('import acdl', import('./acdl/adobe-client-data-layer.min.js')),
  ]);

  if (sessionStorage.getItem('acdl:debug')) {
    import('./acdl/validate.js');
  }
  const { trackHistory } = await import('./commerce.js');
  trackHistory();

  sampleRUM('lazy');
  sampleRUM.observe(main.querySelectorAll('div[data-block-name]'));
  sampleRUM.observe(main.querySelectorAll('picture > img'));

  // Implement experimentation preview pill
  if (
    getMetadata('experiment') ||
    Object.keys(getAllMetadata('campaign')).length ||
    Object.keys(getAllMetadata('audience')).length
  ) {
    // eslint-disable-next-line import/no-relative-packages
    const { loadLazy: runLazy } = await import('../plugins/experimentation/src/index.js');
    await runLazy(document, { audiences: AUDIENCES }, pluginContext);
  }
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  window.setTimeout(() => {
    martechDelayed();
    return import('./delayed.js');
  }, 3000);
  // load anything that can be postponed to the latest here
}

export async function fetchIndex(indexFile, pageSize = 500) {
  const handleIndex = async (offset) => {
    const resp = await fetch(`/${indexFile}.json?limit=${pageSize}&offset=${offset}`);
    const json = await resp.json();

    const newIndex = {
      complete: json.limit + json.offset === json.total,
      offset: json.offset + pageSize,
      promise: null,
      data: [...window.index[indexFile].data, ...json.data],
    };

    return newIndex;
  };

  window.index = window.index || {};
  window.index[indexFile] = window.index[indexFile] || {
    data: [],
    offset: 0,
    complete: false,
    promise: null,
  };

  // Return index if already loaded
  if (window.index[indexFile].complete) {
    return window.index[indexFile];
  }

  // Return promise if index is currently loading
  if (window.index[indexFile].promise) {
    return window.index[indexFile].promise;
  }

  window.index[indexFile].promise = handleIndex(window.index[indexFile].offset);
  const newIndex = await window.index[indexFile].promise;
  window.index[indexFile] = newIndex;

  return newIndex;
}

/**
 * Check if consent was given for a specific topic.
 * @param {*} topic Topic identifier
 * @returns {boolean} True if consent was given
 */
// eslint-disable-next-line no-unused-vars
export function getConsent(topic) {
  /* eslint-disable-next-line no-console */
  console.warn('getConsent not implemented');
  return true;
}

export function preloadHeroImage(picture) {
  const src = [...picture.querySelectorAll('source')]
    .filter((source) => source.getAttribute('type') === 'image/webp')
    .find((source) => {
      const media = source.getAttribute('media');
      return !media || window.matchMedia(media).matches;
    });

  const link = document.createElement('link');
  link.setAttribute('rel', 'preload');
  link.setAttribute('fetchpriority', 'high');
  link.setAttribute('as', 'image');
  link.setAttribute('href', src?.getAttribute('srcset'));
  link.setAttribute('type', src?.getAttribute('type'));
  document.head.append(link);
}

export async function loadPage() {
  if (window.pageInitialized || window.jest) {
    return;
  }

  window.pageInitialized = true;
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

// Load and open chat module if not already present and opening is requested.
const shouldOpenChat =
  !window.havertysChat && (window.location.href.includes('insidechatlink') || window.location.hash === '#openChat');

if (shouldOpenChat) {
  import('scripts/chat/chat.js').then(({ openChat }) => openChat());
}

loadPage();
