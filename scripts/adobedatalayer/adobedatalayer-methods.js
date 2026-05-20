/* eslint-disable */

import { pushEventToDataLayer, pushToDataLayer } from '../../plugins/martech/src/index.js';
import { getMetadata } from 'scripts/aem.js';
import { DataElementsJS, eVarsJS, propsJS } from './adobedatalayer-variables.js';

export const getURLParam = (paramName) => {
  const urlParams = new URLSearchParams(window.location.search);

  return urlParams.get(paramName);
};

// Load acdl get state fallback in case it's not available yet.
if (!window.adobeDataLayer || !window.adobeDataLayer.getState) {
  window.adobeDataLayer = window.adobeDataLayer || [];
  window.adobeDataLayer.getState = () => {
    if (!window.adobeDataLayer || !Array.isArray(window.adobeDataLayer)) {
      console.warn('Adobe Data Layer is not available or not an array.');
      return {};
    }

    const state = {
      data: {
        __adobe: {
          analytics: {},
        },
      },
    };

    window.adobeDataLayer.forEach((item) => {
      if (item && typeof item === 'object' && !Array.isArray(item)) {
        Object.assign(state, item);
      }
    });

    return state;
  };
}

// All Adobe Data Layer functions and variables should be defined inside the AdobeDataLayerJS namespace
const AdobeDataLayerJS = {
  starPattern: /(\d) star/i,
  emailOptIn: 'no',
  selectedFinancingOption: '',
  selectedPaymentMethod: '',
  /**
   * Recursively removes properties with null values from an object.
   * @param {Object} obj - The object to clean.
   * @returns {Object} - The cleaned object.
   */
  removeNullValues: (obj) => {
    if (!obj || typeof obj !== 'object') return obj;

    return Object.entries(obj).reduce((acc, [key, value]) => {
      if (value !== null && value !== undefined) {
        acc[key] = typeof value === 'object' ? AdobeDataLayerJS.removeNullValues(value) : value;
      }
      return acc;
    }, {});
  },
  clearVariables: function () {
    const xdm = window.adobeDataLayer.getState().xdm;
    delete xdm.data;

    pushToDataLayer({ xdm, data: { __adobe: { analytics: null } } });
    pushToDataLayer({ data: { __adobe: { analytics: {} } } });
  },
  // Extends martech pushEventToDataLayer by clearing variables after each event.
  pushEventToDataLayer: (...props) => {
    if (window.isAuthor) {
      return;
    }

    const cleanedProps = props.map((prop) => AdobeDataLayerJS.removeNullValues(prop));
    pushEventToDataLayer(...cleanedProps);
    AdobeDataLayerJS.clearVariables();
  },
  pageLoad: async function () {
    const events = window.adobeDataLayer.getState().data.__adobe.analytics.events
      ? `${window.adobeDataLayer.getState().data.__adobe.analytics.events},event17`
      : 'event17';
    const tags = getMetadata('keywords').split(', ');
    const pageDetails = {
      '@type': 'havertys/components/page',
      'repo:modifyDate': getMetadata('modified-time'),
      'dc:title': document.title,
      'dc:description': getMetadata('description'),
      'xdm:template': '/libs/core/franklin/templates/page',
      'xdm:language': 'en',
      'xdm:tags': tags,
      'repo:path': '/content/havertys-eds/us/en/index.html',
    };

    AdobeDataLayerJS.pushEventToDataLayer(
      'pageLoad',
      {},
      {
        __adobe: {
          analytics: {
            ...window.adobeDataLayer.getState().data.__adobe.analytics, // Append any information not cleared.
            ...pageDetails,
            events,
            pageName: DataElementsJS.get('pageName'),
            pageURL: DataElementsJS.get('urlFull'),
            pageType: DataElementsJS.get('pageType'),
            referrer: DataElementsJS.get('referrer'),
            v3: eVarsJS.get(3),
            v4: eVarsJS.get(4),
            v5: eVarsJS.get(5),
            v6: eVarsJS.get(6),
            v7: eVarsJS.get(7),
            v8: eVarsJS.get(8),
            v9: eVarsJS.get(9),
            v10: eVarsJS.get(10),
            v11: eVarsJS.get(11),
            v12: eVarsJS.get(12),
            v15: eVarsJS.get(15),
            v16: eVarsJS.get(16),
            v17: eVarsJS.get(17),
            v23: eVarsJS.get(23),
            v24: eVarsJS.get(24),
            v54: eVarsJS.get(54),
            v55: eVarsJS.get(55),
            v56: eVarsJS.get(56),
            v57: eVarsJS.get(57),
            v58: eVarsJS.get(58),
            v67: eVarsJS.get(67),
            v69: eVarsJS.get(69),
            prop1: propsJS.get(1),
            prop2: propsJS.get(2),
            prop5: propsJS.get(5),
          },
        },
      },
    );

    // Store current page in session storage for previous page eVar9.
    sessionStorage.setItem('pageName', DataElementsJS.get('pageName'));
  },
  pdpLoad: async function () {
    const productData = document.querySelector('.product-details').getAttribute('data-product');
    const parsedData = JSON.parse(productData);
    const productPriceDiv = document.querySelector('.pdp-price-range .dropin-price').innerText;
    const productConfigDiv = document.querySelector('.pdp-swatches__field.configuration-thumbs .selected-variant');
    const productColorDiv =
      document.querySelector('.pdp-swatches__field.color-variant .selected-color') ||
      document.querySelector('.pdp-swatches__field.finish-variant .selected-finish');
    const productSizeDiv = document.querySelector('.pdp-swatches__field.size-variant .selected-size');

    const productInfo = {
      productName: parsedData.name,
      productID: parsedData.sku,
      productPrice: productPriceDiv ? Number(productPriceDiv.replace('$', '').replace(',', '')) : '',
      productSize: productSizeDiv ? productSizeDiv.innerText.replace('"', '') : '',
      productConfig: productConfigDiv ? productConfigDiv.innerText.replace(/[^A-Za-z0-9\s]/g, '') : '',
      productColor: productColorDiv ? productColorDiv.innerText.replace('Swatch: ', '') : '',
    };

    // Product info is different on every event so manually setting data instead of using eVarsJS.
    // Pushes to datalayer with no event since prodView is included with the pageLoadEDS event (event17).
    window.adobeDataLayer.push({
      data: {
        __adobe: {
          analytics: {
            events: 'prodView',
            products: AdobeDataLayerJS.getProductStringFromProductInfo(productInfo),
            v33: eVarsJS.get(33),
          },
        },
      },
    });
  },
  addToCart: async function (productData) {
    window.adobeDataLayer = window.adobeDataLayer || [];
    const parsedData = JSON.parse(productData);
    const productPriceDiv = document.querySelector('.pdp-price-range .dropin-price').innerText;

    const productInfo = {
      productName: parsedData.name,
      productID: parsedData.sku,
      productPrice:
        parsedData?.prices?.final?.minimumAmount || parsedData?.price || productPriceDiv
          ? Number(productPriceDiv.replace('$', '').replace(',', ''))
          : '',
      productConfig: parsedData.config || '',
      productColor: '',
    };

    const cartCounter = document.querySelector('.cmp-Header__cartTrigger__counter');
    const cartHasOneItem = cartCounter && cartCounter.innerText.includes('(1)');

    const events = cartHasOneItem ? ['scOpen', 'scAdd'] : ['scAdd'];
    const linkTrackingFields = await AdobeDataLayerJS.getLinkTrackingVars();

    AdobeDataLayerJS.pushEventToDataLayer(
      'addToCart',
      {},
      {
        __adobe: {
          analytics: {
            // Add to cart is considered a non page view event so include link tracking vars.
            ...linkTrackingFields,
            events: events.join(','),
            products: AdobeDataLayerJS.getProductStringFromProductInfo(productInfo),
            v14: eVarsJS.get(14),
            v17: eVarsJS.get(17),
            v20: eVarsJS.get(20),
            v33: eVarsJS.get(33),
            v50: eVarsJS.get(50),
            prop5: propsJS.get(5),
          },
        },
      },
    );
  },
  signInSuccess: function () {
    window.adobeDataLayer = window.adobeDataLayer || [];
    window.adobeDataLayer.push({
      event: 'signIn',
      signInDetails: {
        submitStatus: 'success',
      },
    });
  },
  signInFail: function (errorData) {
    window.adobeDataLayer = window.adobeDataLayer || [];
    const parsedData = JSON.parse(errorData);
    window.adobeDataLayer.push({
      event: 'signIn',
      signInDetails: {
        submitStatus: 'error',
        errorDetails: {
          errorMsg: parsedData.errorMsg,
          errorField: parsedData.errorField,
        },
      },
    });
  },
  createAccount: function (createAcctData) {
    window.adobeDataLayer = window.adobeDataLayer || [];
    const parsedData = JSON.parse(createAcctData);
    if (parsedData.submitStatus == 'success') {
      window.adobeDataLayer.push({
        event: 'createAccount',
        createAccountDetails: {
          submitStatus: parsedData.submitStatus,
          emailOptIn: parsedData.emailOptIn,
        },
      });
    } else {
      window.adobeDataLayer.push({
        event: 'createAccount',
        createAccountDetails: {
          submitStatus: parsedData.submitStatus,
          emailOptIn: parsedData.emailOptIn,
          errorDetails: {
            errorMsg: parsedData.errorMsg,
            errorField: parsedData.errorField,
          },
        },
      });
    }
  },
  forgotPassword: function (forgotPasswordData) {
    window.adobeDataLayer = window.adobeDataLayer || [];
    const parsedData = JSON.parse(forgotPasswordData);
    if (parsedData.submitStatus == 'success') {
      window.adobeDataLayer.push({
        event: 'forgotPassword',
        forgotPasswordDetails: {
          submitStatus: parsedData.submitStatus,
        },
      });
    } else {
      window.adobeDataLayer.push({
        event: 'forgotPassword',
        forgotPasswordDetails: {
          submitStatus: parsedData.submitStatus,
          errorDetails: {
            errorMsg: parsedData.errorMsg,
            errorField: parsedData.errorField,
          },
        },
      });
    }
  },
  clickSelect: function (event) {
    const value = event.target.value;
    let elText = event.target.getAttribute('data-layer-label');
    if (!elText) {
      elText = event.target.getAttribute('aria-label');
    }
    if (!elText) {
      elText = event.target.getAttribute('title');
    }

    // not populating the "link location" at this point in time. That tooling isn't even available in EDS repo.
    window.adobeDataLayer.push({
      linkDetails: {
        linkType: 'select',
        linkText: elText + ': ' + value,
        linkElement: event.target.nodeName,
        linkUrl: '',
        downloadLinkUrl: '',
        pageURL: window.location.href,
        parentId: '',
      },
    });

    this.sendLinkClickEvent();
  },
  clickedLink: async function (clickedEl) {
    window.adobeDataLayer = window.adobeDataLayer || [];
    const linkUrl = clickedEl.href;
    var linkText = clickedEl.getAttribute('title');
    if (!linkText) {
      linkText = clickedEl.getAttribute('aria-label');
    }
    if (!linkText) {
      linkText = clickedEl.innerText;
    }
    if (!linkText && linkUrl) {
      linkText = linkUrl.split('/').pop();
    }
    var dataLayerLabel = clickedEl.getAttribute('data-layer-label');
    if (dataLayerLabel) {
      linkText = dataLayerLabel;
    }
    if (clickedEl.classList.contains('pr-rid-tile-overlay')) {
      linkText = 'Customer Photo';
    }
    if (clickedEl.classList.contains('pr-histogram-stars')) {
      const match = clickedEl.getAttribute('aria-label').match(AdobeDataLayerJS.starPattern);
      if (match) {
        const numStars = match[1];
        linkText = 'Reviews filter: ' + numStars + ' stars only';
      } else {
        console.error('Reviews filter parsing failed.');
        linkText = 'Reviews filter: unknown';
      }
    }
    var downloadLinkUrl;
    var linkType = 'other';
    if (clickedEl.hasAttribute('download')) {
      downloadLinkUrl = linkUrl;
      linkType = 'download';
    }
    if (linkUrl && linkUrl.indexOf('havertys') === -1) {
      linkType = 'exit';
    }
    //Since components are inconsistent in how they present data attributes and elements, multiple tests need to be run to populate values
    var linkLocation;
    var schemaType;
    var schemaTitle;
    var schemaURL;
    const linkLocations = ['*[data-cmp-data-layer]', '.swiper', '#header', '#footer', '.product-details-container'];
    linkLocations.forEach(function (location) {
      const closestEl = clickedEl.closest(location);
      if (closestEl) {
        const dataAttr = closestEl.getAttribute('data-cmp-data-layer');
        if (dataAttr) {
          const parsedData = JSON.parse(dataAttr);
          linkLocation = Object.keys(parsedData)[0];
          schemaType = parsedData[linkLocation]['@type'];
          schemaTitle = parsedData[linkLocation]['dc:title'];
          schemaURL = parsedData[linkLocation]['xdm:linkURL'];
        }
        if (location == '.swiper') {
          const heading = closestEl.querySelector('h2');
          if (heading) {
            linkLocation = heading.innerText;
          } else {
            linkLocation = closestEl.id;
          }
        }
        if (location === '.product-details-container' && clickedEl.closest(location) !== null) {
          schemaTitle = document.querySelector('.pdp-header__title').innerText;
        }
        if (location == '#header' || location == '#footer') {
          linkLocation = location.replace('#', '');
        }
      }
    });
    if (linkText) {
      // Store link details in adobeDataLayer state for use in data elements.
      adobeDataLayer.push({
        linkDetails: {
          linkName: linkText,
          linkType: linkType,
          linkText: linkText,
          linkElement: clickedEl.nodeName,
          linkUrl: linkUrl,
          downloadLinkUrl: downloadLinkUrl,
          pageURL: window.location.href,
          linkLocation: linkLocation,
          '@type': schemaType,
          'dc:title': schemaTitle,
          'xdm:linkURL': schemaURL,
          parentId: '',
          ...(linkUrl?.trim() &&
            !linkUrl.trim().endsWith('#') &&
            linkUrl.includes('/') && {
              nextPageName: linkUrl.split('/')?.pop(),
              nextPageMethod:
                clickedEl
                  ?.closest('[data-block-name]')
                  ?.getAttribute('data-block-name')
                  ?.split('-')
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ') || '',
              nextPageURL: linkUrl,
            }),
        },
      });

      this.sendLinkClickEvent();
    }
  },
  sendLinkClickEvent: async () => {
    // Push linkClick event to adobeDataLayer with link details from above.
    const linkTrackingFields = await AdobeDataLayerJS.getLinkTrackingVars();
    AdobeDataLayerJS.pushEventToDataLayer(
      'linkClick',
      {},
      {
        __adobe: {
          analytics: {
            ...linkTrackingFields,
            v20: eVarsJS.get(20),
            v21: eVarsJS.get(21),
            v50: eVarsJS.get(50),
            v51: eVarsJS.get(51),
            v71: eVarsJS.get(71),
            v72: eVarsJS.get(72),
            v73: eVarsJS.get(73),
            prop6: propsJS.get(6),
            linkName: DataElementsJS.get('linkName'),
            linkType: DataElementsJS.get('linkType'),
            linkURL: DataElementsJS.get('linkUrl'),
            events: 'event18',
          },
        },
      },
    );
  },
  searchResults: function () {
    window.adobeDataLayer = window.adobeDataLayer || [];
    var searchTerm = getURLParam('search_query');
    var dataProductResults = document.querySelector('[data-product-results]');
    var dataContentResults = document.querySelector('[data-content-results]');
    var productResultCount = dataProductResults
      ? parseInt(dataProductResults.getAttribute('data-product-results'), 10)
      : 0;
    var contentResultCount = dataContentResults
      ? parseInt(dataContentResults.getAttribute('data-content-results'), 10)
      : 0;
    var searchRecommendationClick = 'no';
    if (sessionStorage.getItem('searchRecommendationClick')) {
      searchRecommendationClick = 'yes';
      sessionStorage.removeItem('searchRecommendationClick');
    }
    window.adobeDataLayer.push({
      event: 'search',
      searchDetails: {
        searchTerm: searchTerm,
        searchRecommendationClick: searchRecommendationClick,
        productResultCount: productResultCount,
        contentResultCount: contentResultCount,
      },
    });
  },
  searchResultsClick: function (clickedEl) {
    window.adobeDataLayer = window.adobeDataLayer || [];
    const searchData = document.querySelector('.ds-widgets').getAttribute('data-search-data-layer');
    const parsedData = JSON.parse(searchData);
    const product = clickedEl.closest('.ds-sdk-product-item');
    window.adobeDataLayer.push({
      event: 'searchResultsClick',
      searchResultDetails: {
        searchTerm: parsedData.searchTerm,
        linkText: product.getAttribute('data-name'),
        linkRanking: product.getAttribute('data-index'),
      },
    });
  },
  filterClick: function (parsedData) {
    window.adobeDataLayer = window.adobeDataLayer || [];
    window.adobeDataLayer.push({
      event: 'filterClick',
      filterClickDetails: {
        filterDetail: {
          category: parsedData.category,
          filterValue: parsedData.filterValue,
        },
      },
    });
  },
  emailSignup: function (error) {
    window.adobeDataLayer = window.adobeDataLayer || [];
    if (error) {
      window.adobeDataLayer.push({
        event: 'emailRegistration',
        emailRegistrationDetails: {
          submitStatus: 'error',
          errorDetails: {
            errorMsg: error,
            errorField: 'email',
          },
        },
      });
    } else {
      window.adobeDataLayer.push({
        event: 'emailRegistration',
        emailRegistrationDetails: {
          submitStatus: 'success',
        },
      });
    }
  },
  zipCodeSuccess: function (form, zipCode) {
    try {
      window.adobeDataLayer = window.adobeDataLayer || [];
      window.adobeDataLayer.push({
        event: 'zipCodeEntry',
        zipCodeDetails: {
          submitStatus: 'success',
          form: form,
          zipCode: zipCode,
        },
      });
    } catch (error) {
      console.error(error);
    }
  },
  zipCodeFail: function (form, zipCode, error) {
    try {
      window.adobeDataLayer = window.adobeDataLayer || [];
      if (error) {
        window.adobeDataLayer.push({
          event: 'zipCodeEntry',
          zipCodeDetails: {
            submitStatus: 'error',
            form: form,
            zipCode: zipCode,
            errorDetails: {
              errorMsg: error,
            },
          },
        });
      }
    } catch (error) {
      console.error(error);
    }
  },
  makeAppointment: function (parsedData, error) {
    window.adobeDataLayer = window.adobeDataLayer || [];
    //Format timeslot
    const selectedDate = parsedData.selectedDate
      .toLocaleString('en-us', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
      .replace(/,/g, '');
    var selectedTime = parsedData.selectedTime;
    if (selectedTime > 12) {
      selectedTime = (selectedTime - 12).toString() + ':00 pm';
    }
    if (selectedTime < 12) {
      selectedTime = selectedTime.toString() + ':00 am';
    }
    if (selectedTime == 12) {
      selectedTime = selectedTime.toString() + ':00 pm';
    }
    const timeSlot = selectedTime + ' ' + selectedDate;
    if (!error) {
      window.adobeDataLayer.push({
        event: 'makeAnAppointment',
        makeAnAppointmentDetails: {
          submitStatus: 'success',
          appointmentDetails: {
            timeSlot: timeSlot,
            location: parsedData.selectedStoreData.storeName,
          },
        },
      });
    } else {
      window.adobeDataLayer.push({
        event: 'makeAnAppointment',
        makeAnAppointmentDetails: {
          submitStatus: 'error',
          appointmentDetails: {
            timeSlot: timeSlot,
            location: parsedData.selectedStoreData.storeName,
          },
          errorDetails: {
            errorMsg: error,
          },
        },
      });
    }
  },
  formatProduct: function (product) {
    let prodColor = '';
    let prodConfig = '';
    let prodQuantity = '';
    let prodSKU = '';
    let prodName = '';
    let prodPrice = '';
    let prodRowSaleTotal = '';

    if (window.checkoutDetails && window.checkoutDetails.hasOwnProperty('isPayNow')) {
      //Pay Now Checkout
      prodQuantity = product.quantity;
      prodSKU = product.item;
      prodName = product.description;
      prodPrice = product.unitRetail;
      prodRowSaleTotal = product.quantity * product.unitRetail;
    } else {
      //Normal checkout
      prodQuantity = product.quantity;
      prodSKU = product.product.sku;
      prodName = product.product.name;
      prodPrice = product.prices.unit_discount_price.value;
      prodRowSaleTotal = product.prices.row_total_after_discount.value;
      const configurations = product.configurable_options;
      if (configurations) {
        configurations.forEach(function (configuration) {
          const optionLabel = configuration.option_label;
          if (optionLabel == 'Color' || optionLabel == 'Finish') {
            prodColor = configuration.value_label;
          }
          if (optionLabel == 'Configuration' || optionLabel == 'Size') {
            prodConfig = configuration.value_label.replace(/[^A-Za-z0-9\s]/g, '');
          }
        });
      }
    }
    const productObj = {
      quantity: prodQuantity,
      offerCode: DataElementsJS.get('offerCode'),
      productInfo: {
        productID: prodSKU,
        productName: prodName,
        productConfig: prodConfig,
        productColor: prodColor,
        productPrice: prodPrice,
        prodRowSaleTotal: prodRowSaleTotal,
      },
    };
    return productObj;
  },
  // Taken from the Adobe Analytics Extension custom code configuration in launch.
  getLinkTrackingVars: async function () {
    const v13 = await eVarsJS.get(13);

    return {
      pageType: DataElementsJS.get('pageType'),
      pageName: DataElementsJS.get('pageName'),
      pageURL: DataElementsJS.get('urlFull'),
      server: DataElementsJS.get('hostname'),
      channel: DataElementsJS.get('subSection1'),
      v8: eVarsJS.get(8),
      v11: eVarsJS.get(11),
      v13,
      v17: eVarsJS.get(17),
      prop1: propsJS.get(1),
      prop2: propsJS.get(2),
      prop10: propsJS.get(10),
    };
  },
  getProductStringFromProductInfo: function (productInfo) {
    return `;${productInfo.productID};1;${productInfo.productPrice};;eVar28=${productInfo.productName}|eVar29=${productInfo.productID}|eVar30=${productInfo.productConfig}|eVar31=${productInfo.productColor}|eVar32=${productInfo.productPrice}`;
  },
  setProductsArray: function (products) {
    window.cartItemsArray = [];
    if (products) {
      products.forEach(function (product) {
        const productObj = AdobeDataLayerJS.formatProduct(product);
        window.cartItemsArray.push(productObj);
      });
    }
  },
  cartView: function () {
    window.adobeDataLayer = window.adobeDataLayer || [];
    window.adobeDataLayer.push({
      event: 'cartView',
      cartViewDetails: {
        products: [...window.cartItemsArray],
      },
    });
  },
  removeFromCart: function (product) {
    window.adobeDataLayer = window.adobeDataLayer || [];
    window.adobeDataLayer.push({
      event: 'cartRemove',
      cartRemoveDetails: AdobeDataLayerJS.formatProduct(product),
    });
  },
  checkoutStep: function () {
    window.adobeDataLayer = window.adobeDataLayer || [];
    window.adobeDataLayer.push({
      event: 'checkout',
      checkoutDetails: {
        checkout: Object.assign({}, window.checkoutDetails),
        product: [...window.cartItemsArray],
      },
    });
  },
  scheduleDeliverySubmit: function (isSchedulePickup) {
    const event = isSchedulePickup ? 'event14' : 'event13';
    AdobeDataLayerJS.pushEventToDataLayer(
      'scheduleDeliverySubmit',
      {},
      {
        __adobe: {
          analytics: {
            events: event,
          },
        },
      },
    );
  },
  availableDates: function (scheduleDetails) {
    window.adobeDataLayer = window.adobeDataLayer || [];
    window.adobeDataLayer.push({
      event: 'availableDates',
      scheduleDetails: Object.assign({}, scheduleDetails),
    });
  },
  placeOrder: function () {
    window.adobeDataLayer = window.adobeDataLayer || [];
    window.adobeDataLayer.push({
      event: 'placeOrder',
      placeOrderDetails: {
        placeOrder: Object.assign({}, window.checkoutDetails),
        product: [...window.cartItemsArray],
      },
    });
  },
  confirmOrder: function () {
    window.adobeDataLayer = window.adobeDataLayer || [];
    window.adobeDataLayer.push({
      event: 'purchase',
      purchaseDetails: {
        purchase: Object.assign({}, window.checkoutDetails),
        product: [...window.cartItemsArray],
      },
    });
  },
  getProtectionPlans: function (products) {
    products.forEach(function (product) {
      var protection = product.warranty_selected == true ? 'yes' : 'no';
      AdobeDataLayerJS.setProtectionPlan(product.product.sku, protection);
    });
  },
  setProtectionPlan: function (sku, protection) {
    window.cartItemsArray.forEach(function (product) {
      if (product.productInfo.productID.replace('-', '') == sku.replace('-', '')) {
        product.protectionPlan = protection;
      }
    });
  },
  sendCartToStore: function (storeLocation) {
    window.adobeDataLayer = window.adobeDataLayer || [];
    window.adobeDataLayer.push({
      event: 'sendCartToStore',
      sendCartToStoreDetails: {
        storeLocation: storeLocation,
        product: [...window.cartItemsArray],
      },
    });
  },
  sendSiteError: function ({ errorMsg, errorField } = {}) {
    AdobeDataLayerJS.pushEventToDataLayer(
      'siteError',
      {},
      {
        __adobe: {
          analytics: {
            events: 'event1',
            list1: errorMsg,
            list2: errorField,
          },
        },
      },
    );
  },
};

// You get autocomplete this way.
window.AdobeDataLayerJS = AdobeDataLayerJS;

export default window.AdobeDataLayerJS;
