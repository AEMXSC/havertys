import viewedOffsets from './viewedOffsets.js';

const getPageType = () => {
  // Currently only using CMS, Category and Product. Added other types for completeness
  // and to be used in the future.
  const PageTypes = {
    CMS: 'CMS',
    CATEGORY: 'Category',
    PRODUCT: 'Product',
    CART: 'Cart',
    CHECKOUT: 'Checkout',
  };

  if (document.querySelector('[data-cif-product-context]')) {
    return PageTypes.PRODUCT;
  }
  if (document.querySelector('[data-cif-category-context]')) {
    return PageTypes.CATEGORY;
  }
  return PageTypes.CMS;
};
const getStorefrontEvents = () => {
  if (window.adobeDataLayer && window.magentoStorefrontEvents) {
    return window.magentoStorefrontEvents;
  }
  return false;
};
export default function usePageEvent() {
  const mse = getStorefrontEvents();
  const { minXOffset, maxXOffset, minYOffset, maxYOffset } = viewedOffsets();
  const pageType = getPageType();

  // eslint-disable-next-line func-names
  const sendPageEvent = function () {
    const context = {
      pageType,
      eventType: 'pageUnload',
      maxXOffset: maxXOffset.current,
      maxYOffset: maxYOffset.current,
      minXOffset: minXOffset.current,
      minYOffset: minYOffset.current,
      ping_interval: 0,
      pings: 0,
    };
    mse.context.setPage(context);
    mse.publish.pageView();
  };

  // Add event listener for 'beforeunload' event
  window.addEventListener('beforeunload', sendPageEvent);

  // Return a cleanup function that removes the event listener
  return function cleanup() {
    window.removeEventListener('beforeunload', sendPageEvent);
  };
}
