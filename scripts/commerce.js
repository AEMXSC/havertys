/* eslint-disable import/prefer-default-export, import/no-cycle */
import { getConfigValue, getCookie } from './configs.js';
import { getConsent } from './scripts.js';

/* Common query fragments */
export const priceFieldsFragment = `fragment priceFields on ProductViewPrice {
  roles
  regular {
      amount {
          currency
          value
      }
  }
  final {
      amount {
          currency
          value
      }
  }
}`;

/* Queries PDP */
export const refineProductQuery = `query RefineProductQuery($sku: String!, $variantIds: [String!]!) {
  refineProduct(
    sku: $sku,
    optionIds: $variantIds
  ) {
    sku
    name
    urlKey
    images(roles: []) {
      url
      roles
      label
    }
    ... on SimpleProductView {
      price {
        ...priceFields
      }
    }
    addToCartAllowed
  }
}
${priceFieldsFragment}`;

export const productDetailQuery = `query ProductQuery($sku: String!) {
  products(skus: [$sku]) {
    __typename
    id
    externalId
    sku
    name
    description
    shortDescription
    url
    urlKey
    inStock
    metaTitle
    metaKeyword
    metaDescription
    addToCartAllowed
    images(roles: []) {
      url
      label
      roles
    }
    attributes(roles: []) {
      name
      label
      value
      roles
    }
    ... on SimpleProductView {
      price {
        ...priceFields
      }
    }
    ... on ComplexProductView {
      options {
        id
        title
        required
        values {
          id
          title
          inStock
          ...on ProductViewOptionValueSwatch {
            type
            value
          }
        }
      }
      priceRange {
        maximum {
          ...priceFields
        }
        minimum {
          ...priceFields
        }
      }
    }
  }
}
${priceFieldsFragment}`;

// see performPaginatedVariantsQuery()
export const getProductVariants = `query GET_PRODUCT_VARIANTS($sku: String!, $cursor: String) {
      variants(sku: $sku, cursor: $cursor) {
        cursor
        variants {
          selections
          product {
            sku
            name
            inStock
          }
        }
      }
    }`;

export const productSearchQuery = (addCategory = false) => `query ProductSearch(
  $currentPage: Int = 1
  $pageSize: Int = 20
  $phrase: String = ""
  $sort: [ProductSearchSortInput!] = []
  $filter: [SearchClauseInput!] = []
  ${addCategory ? '$categoryId: String!' : ''}
) {
  ${
    addCategory
      ? `categories(ids: [$categoryId]) {
      name
      urlKey
      urlPath
  }`
      : ''
  }
  productSearch(
      current_page: $currentPage
      page_size: $pageSize
      phrase: $phrase
      sort: $sort
      filter: $filter
  ) {
      items {
          product {
            id
          }
          productView {
            __typename
            id
            sku
            name
            shortDescription
            metaDescription
            metaKeyword
            metaTitle
            description
            inStock
            addToCartAllowed
            url
            urlKey
            externalId

            images(roles: []) {
              url
              label
              roles
            }

            attributes(roles: []) {
              name
              label
              value
              roles
            }

          ... on SimpleProductView {
              price {
                  roles

                  regular {
                      amount {
                          value
                          currency
                      }
                  }

                  final {
                      amount {
                          value
                          currency
                      }
                  }
              }
          }


            ... on ComplexProductView {
              options {
                id
                title
                required
                multi
                values {
                  id
                  title
                  inStock
                  __typename
                  ... on ProductViewOptionValueProduct {
                    title
                    quantity
                    isDefault
                    __typename
                    product {
                      sku
                      shortDescription
                      metaDescription
                      metaKeyword
                      metaTitle
                      name
                      price {
                        final {
                          amount {
                            value
                            currency
                          }
                        }
                        regular {
                          amount {
                            value
                            currency
                          }
                        }
                        roles
                      }
                    }
                  }
                  ... on ProductViewOptionValueSwatch {
                    id
                    title
                    type
                    value
                    inStock
                  }
                }
              }

              priceRange {
                maximum {
                  final {
                    amount {
                      value
                      currency
                    }
                  }
                  regular {
                    amount {
                      value
                      currency
                    }
                  }
                  roles
                }
                minimum {
                  final {
                    amount {
                      value
                      currency
                    }
                  }
                  regular {
                    amount {
                      value
                      currency
                    }
                  }
                  roles
                }
              }
            }
          }
      }
  }
}
`;

export async function commerceEndpointWithQueryParams() {
  // Set Query Parameters so they can be appended to the endpoint
  const urlWithQueryParams = new URL(await getConfigValue('commerce-endpoint'));
  urlWithQueryParams.searchParams.append('Magento-Environment-Id', await getConfigValue('commerce-environment-id'));
  urlWithQueryParams.searchParams.append('Magento-Website-Code', await getConfigValue('commerce-website-code'));
  urlWithQueryParams.searchParams.append('Magento-Store-View-Code', await getConfigValue('commerce-store-view-code'));
  urlWithQueryParams.searchParams.append('Magento-Store-Code', await getConfigValue('commerce-store-code'));
  urlWithQueryParams.searchParams.append('Magento-Customer-Group', await getConfigValue('commerce-customer-group'));
  return urlWithQueryParams;
}

/* Common functionality */

export async function performCatalogServiceQuery(query, variables, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'hvt-cacheable': 'true',
    'Magento-Environment-Id': await getConfigValue('commerce-environment-id'),
    'Magento-Website-Code': await getConfigValue('commerce-website-code'),
    'Magento-Store-View-Code': await getConfigValue('commerce-store-view-code'),
    'Magento-Store-Code': await getConfigValue('commerce-store-code'),
    'Magento-Customer-Group': await getConfigValue('commerce-customer-group'),
    'x-api-key': await getConfigValue('commerce-x-api-key'),
  };

  const apiCall = new URL(await getConfigValue('commerce-endpoint'));
  apiCall.searchParams.append('query', query.replace(/(?:\r\n|\r|\n|\t|[\s]{4})/g, ' ').replace(/\s\s+/g, ' '));
  apiCall.searchParams.append('variables', variables ? JSON.stringify(variables) : null);

  const response = await fetch(apiCall, {
    method: 'GET',
    headers,
    ...options,
  });

  if (!response.ok) {
    return null;
  }

  const queryResponse = await response.json();

  return queryResponse.data;
}

// see getProductVariants query
export async function performPaginatedVariantsQuery(sku) {
  let result = await performCatalogServiceQuery(getProductVariants, { sku });
  let { variants } = result.variants;
  while (result.variants.cursor) {
    // eslint-disable-next-line no-await-in-loop
    result = await performCatalogServiceQuery(getProductVariants, { sku, cursor: result.variants.cursor });
    variants = variants.concat(result.variants.variants);
  }
  return variants;
}

export function getSignInToken() {
  const userToken = getCookie('auth_dropin_user_token');

  // Removing Sign In token when the user is not logged in
  if (!userToken) {
    if (window.localStorage.getItem('M2_VENIA_BROWSER_PERSISTENCE__signin_token')) {
      window.localStorage.removeItem('M2_VENIA_BROWSER_PERSISTENCE__signin_token');
    }
  }

  return userToken;
}

/* Use safeQuery instead if wanting correct error handling */
export async function performMonolithGraphQLQuery(query, variables, GET = true, USE_TOKEN = false, options = {}) {
  const GRAPHQL_ENDPOINT = await getConfigValue('commerce-core-endpoint');

  const headers = {
    'Content-Type': 'application/json',
    Store: await getConfigValue('commerce-store-view-code'),
  };

  if (USE_TOKEN) {
    if (typeof USE_TOKEN === 'string') {
      headers.Authorization = `Bearer ${USE_TOKEN}`;
    } else {
      const token = getSignInToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }
  }

  let response;
  if (!GET) {
    response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query: query.replace(/(?:\r\n|\r|\n|\t|[\s]{4})/g, ' ').replace(/\s\s+/g, ' '),
        variables,
      }),
      ...options,
    });
  } else {
    const endpoint = new URL(GRAPHQL_ENDPOINT);
    endpoint.searchParams.set('query', query.replace(/(?:\r\n|\r|\n|\t|[\s]{4})/g, ' ').replace(/\s\s+/g, ' '));
    if (variables) {
      endpoint.searchParams.set('variables', JSON.stringify(variables));
    }
    response = await fetch(endpoint.toString(), { headers, ...options });
  }

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export function renderPrice(
  product,
  format,
  html = (strings, ...values) => strings.reduce((result, string, i) => result + string + (values[i] || ''), ''),
  Fragment = null,
) {
  // Simple product
  if (product.price) {
    const { regular, final } = product.price;
    if (regular.amount.value === final.amount.value) {
      return html`<span class="price-final">${format(final.amount.value)}</span>`;
    }
    return html`<${Fragment}>
      <span class="price-regular">${format(regular.amount.value)}</span> <span class="price-final">${format(final.amount.value)}</span>
    </${Fragment}>`;
  }

  // Complex product
  if (product.priceRange) {
    const { regular: regularMin, final: finalMin } = product.priceRange.minimum;
    const { final: finalMax } = product.priceRange.maximum;

    if (finalMin.amount.value !== finalMax.amount.value) {
      return html` <div class="price-range">
        ${finalMin.amount.value !== regularMin.amount.value
          ? html`<span class="price-regular">${format(regularMin.amount.value)}</span>`
          : ''}
        <span class="price-from">${format(finalMin.amount.value)} - ${format(finalMax.amount.value)}</span>
      </div>`;
    }

    if (finalMin.amount.value !== regularMin.amount.value) {
      return html`<${Fragment}>
      <span class="price-final">${format(finalMin.amount.value)} - ${format(regularMin.amount.value)}</span>
    </${Fragment}>`;
    }

    return html`<span class="price-final">${format(finalMin.amount.value)}</span>`;
  }

  return null;
}

/* PDP specific functionality */

export function getUrlKeyFromUrl() {
  const { pathname } = window.location;

  return pathname.split('/').slice(-1)[0];
}

export function getOptionsUIDsFromUrl() {
  return new URLSearchParams(window.location.search).get('optionsUIDs')?.split(',');
}

const productsCache = {};

export async function getProductByUrlKey(urlKey, query = productSearchQuery(false)) {
  if (productsCache[urlKey]) {
    return productsCache[urlKey];
  }

  const variables = {};
  variables.filter = [];
  variables.filter.push({ attribute: 'url_key', eq: urlKey });
  variables.filter.push({ attribute: 'option' });
  const rawProductPromise = performCatalogServiceQuery(query, variables);
  const productPromise = rawProductPromise.then((productData) => {
    if (!productData?.productSearch.items?.[0]?.productView) {
      return null;
    }

    return productData.productSearch.items[0].productView;
  });

  productsCache[urlKey] = productPromise;

  return productPromise;
}

export async function getProduct(sku) {
  // eslint-disable-next-line no-param-reassign
  sku = sku?.toUpperCase();
  if (productsCache[sku]) {
    return productsCache[sku];
  }
  const rawProductPromise = performCatalogServiceQuery(productDetailQuery, { sku });
  const productPromise = rawProductPromise.then((productData) => {
    if (!productData?.products?.[0]) {
      return null;
    }

    return productData?.products?.[0];
  });

  productsCache[sku] = productPromise;
  return productPromise;
}

export async function trackHistory() {
  if (!getConsent('commerce-recommendations')) {
    return;
  }
  // Store product view history in session storage
  const storeViewCode = await getConfigValue('commerce-store-view-code');
  window.adobeDataLayer.push((dl) => {
    dl.addEventListener(
      'adobeDataLayer:change',
      (event) => {
        if (!event.productContext) {
          return;
        }
        const key = `${storeViewCode}:productViewHistory`;
        let viewHistory = JSON.parse(window.localStorage.getItem(key) || '[]');
        viewHistory = viewHistory.filter((item) => item.sku !== event.productContext.sku);
        viewHistory.push({ date: new Date().toISOString(), sku: event.productContext.sku });
        window.localStorage.setItem(key, JSON.stringify(viewHistory.slice(-10)));
      },
      { path: 'productContext' },
    );
    dl.addEventListener('place-order', () => {
      const shoppingCartContext = dl.getState('shoppingCartContext');
      if (!shoppingCartContext) {
        return;
      }
      const key = `${storeViewCode}:purchaseHistory`;
      const purchasedProducts = shoppingCartContext.items.map((item) => item.product.sku);
      const purchaseHistory = JSON.parse(window.localStorage.getItem(key) || '[]');
      purchaseHistory.push({ date: new Date().toISOString(), items: purchasedProducts });
      window.localStorage.setItem(key, JSON.stringify(purchaseHistory.slice(-5)));
    });
  });
}

export function setJsonLd(data, name) {
  const existingScript = document.head.querySelector(`script[data-name="${name}"]`);
  if (existingScript) {
    existingScript.innerHTML = JSON.stringify(data);
    return;
  }

  const script = document.createElement('script');
  script.type = 'application/ld+json';

  script.innerHTML = JSON.stringify(data);
  script.dataset.name = name;
  document.head.appendChild(script);
}

export async function loadErrorPage(code = 404) {
  const htmlText = await fetch(`/${code}.html`).then((response) => {
    if (response.ok) {
      return response.text();
    }
    throw new Error(`Error getting ${code} page`);
  });
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlText, 'text/html');
  document.body.innerHTML = doc.body.innerHTML;
  // get dropin styles
  document.head.querySelectorAll('style[data-dropin]').forEach((style) => {
    doc.head.appendChild(style);
  });
  document.head.innerHTML = doc.head.innerHTML;

  // Tell scripts.js to load page again.
  window.pageInitialized = false;

  // https://developers.google.com/search/docs/crawling-indexing/javascript/fix-search-javascript
  // Point 2. prevent soft 404 errors
  if (code === 404) {
    const metaRobots = document.createElement('meta');
    metaRobots.name = 'robots';
    metaRobots.content = 'noindex';
    document.head.appendChild(metaRobots);
  }

  // When moving script tags via innerHTML, they are not executed. They need to be re-created.
  const notImportMap = (c) => c.textContent && c.type !== 'importmap';
  Array.from(document.head.querySelectorAll('script'))
    .filter(notImportMap)
    .forEach((c) => c.remove());
  Array.from(doc.head.querySelectorAll('script'))
    .filter(notImportMap)
    .forEach((oldScript) => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach(({ name, value }) => {
        newScript.setAttribute(name, value);
      });
      const scriptText = document.createTextNode(oldScript.innerHTML);
      newScript.appendChild(scriptText);
      document.head.appendChild(newScript);
    });
}

export function mapProductAcdl(product) {
  const regularPrice =
    product?.priceRange?.minimum?.regular?.amount.value ||
    product?.price_range?.minimum_price?.regular_price?.value ||
    product?.price?.regular?.amount.value ||
    product?.prices?.regular?.amount ||
    0;
  const specialPrice =
    product?.priceRange?.minimum?.final?.amount.value ||
    product?.price_range?.minimum_price?.final_price?.value ||
    product?.price?.final?.amount.value ||
    product?.prices?.final?.amount;
  const currencyCode =
    product?.priceRange?.minimum?.final?.amount.currency ||
    product?.price_range?.minimum_price?.final_price?.currency ||
    product?.price?.final?.amount.currency ||
    product?.prices?.final?.currency ||
    undefined;
  const minimalPrice = product?.priceRange || product?.price_range ? regularPrice : undefined;
  const maximalPrice =
    product?.priceRange || product?.price_range
      ? product?.priceRange?.maximum?.regular?.amount.value || product?.price_range?.maximum_price?.regular_price?.value
      : undefined;
  let productType;
  if (product?.product_type === 'configurable') {
    productType = 'configurable';
  } else if (product?.variantSku === product?.sku) {
    productType = 'simple';
  } else {
    // in this case, we have a variant product. Those are technically simple products, but Adobe data collection needs them to be marked as configurable to work properly.
    productType = 'configurable';
  }
  const urlKey = product?.urlKey || product?.url_key;
  const canonicalUrl = product?.canonical_url;
  const mainImageUrl = product?.thumbnail?.url || product?.images?.[0]?.url;
  const productId = parseInt(product.externalId || product?.id, 10) || product?.uid;

  const result = {
    productId: Number(productId || 0),
    name: product?.name || null,
    sku: product?.variantSku || product?.sku || null,
    topLevelSku: product?.sku || null,
    pricing: {
      regularPrice,
      minimalPrice,
      maximalPrice,
      specialPrice,
      currencyCode,
      tierPricing: null,
    },
    canonicalUrl: canonicalUrl || new URL(`/products/${urlKey}/${product.sku}`, window.location.origin).toString(),
    mainImageUrl,
    categories: product?.categories || null,
    specialToDate: null,
    specialFromDate: null,
    newToDate: null,
    newFromDate: null,
    createdAt: null,
    updatedAt: null,
    manufacturer: null,
    countryOfManufacture: null,
    productType,
  };

  if (product?.thumbnail?.url) {
    result.image = {
      alt: product?.thumbnail?.label,
      src: product?.thumbnail?.url,
    };
  }

  return result;
}

// Helper function to grab sku from product and add to cart.
export async function handleAddProductToCart({ product, openCart, source, quantity = 1 } = {}) {
  try {
    const { cartApi } = await import('scripts/minicart/api.js');

    if (!product) {
      throw new Error(`Add to cart not allowed: product is undefined`);
    }

    const { variantSku } = product;
    const defaultSku = product.attributes.find((attr) => attr.id === 'hvt_30' || attr.name === 'hvt_30')?.value;
    const skuToAdd = variantSku ?? defaultSku;

    const { cart, error } = await cartApi.addToCart({
      sku: skuToAdd,
      options: product.optionUIDs,
      quantity,
      openCart,
      source,
    });

    // Don't throw since we don't want to log it as a handleAddProductToCart error.
    if (error) {
      return { error, cart: null };
    }

    return { error: null, cart };
  } catch (error) {
    console.error('Error in handleAddProductToCart: ', error);
    return { error, cart: null };
  }
}

// Helper function to dynamically import errors.js
export async function loadErrorResources() {
  try {
    return await import('./errors.js');
  } catch (importError) {
    console.error('Failed to load error resources:', importError);
    throw new Error('An unknown error occurred while loading errors.js file.');
  }
}

/**
 * GraphQL Wrapper
 * Executes a GraphQL query safely, handling both network and GraphQL-level errors.
 * @returns {Promise<{ result?: any, error?: Error|string }>} - The result or an error object.
 */
export const safeQuery = async ({
  query,
  variables,
  responsePath,
  GET = false,
  USE_TOKEN = true,
  defaultErrorMessage = null,
  options = {},
}) => {
  let data;
  let errors;

  // Catch any GraphQL unknown errors with request.
  try {
    ({ data, errors } = await performMonolithGraphQLQuery(query, variables, GET, USE_TOKEN, options));
  } catch (networkError) {
    if (networkError.name !== 'AbortError') {
      console.error(`[safeQuery] Network error [${responsePath}]`);
    }

    try {
      const { ErrorMessages, ErrorCodes } = await loadErrorResources();
      const err = new Error(ErrorMessages[ErrorCodes.UNKNOWN_GRAPHQL_ERROR]);
      return { error: err };
    } catch (fallbackError) {
      return { error: fallbackError };
    }
  }

  // Handle errors returned by successful GraphQL request.
  try {
    const { ErrorMessages, ErrorCodes, handleErrors } = await loadErrorResources();
    handleErrors(errors, defaultErrorMessage || ErrorMessages[ErrorCodes.DEFAULT]);
    const result = responsePath.split('.').reduce((obj, key) => obj?.[key], data);
    if (result === undefined) {
      console.error(`GraphQL error unexpected response from server ${responsePath}`);
      return { error: defaultErrorMessage || ErrorMessages[ErrorCodes.DEFAULT] };
    }
    return { result };
  } catch (error) {
    console.error(`GraphQL error ${responsePath}:`, error?.originalMessage || error);
    return { error };
  }
};
