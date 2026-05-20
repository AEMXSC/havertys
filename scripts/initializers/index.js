/* eslint-disable import/no-cycle */
// Drop-in Tools
import { events } from '@dropins/tools/event-bus.js';
import { removeFetchGraphQlHeader, setEndpoint, setFetchGraphQlHeader } from '@dropins/tools/fetch-graphql.js';

// Libs
import { getConfigValue, getCookie } from '../configs.js';

export const getUserTokenCookie = () => getCookie('auth_dropin_user_token');

// Update auth headers
const setAuthHeaders = (state) => {
  if (state) {
    const token = getUserTokenCookie();
    setFetchGraphQlHeader('Authorization', `Bearer ${token}`);
  } else {
    removeFetchGraphQlHeader('Authorization');
  }
};

const persistCartDataInSession = (data) => {
  if (data?.id) {
    sessionStorage.setItem('DROPINS_CART_ID', data.id);
    let cartData = localStorage.getItem('M2_VENIA_BROWSER_PERSISTENCE__cartId');
    if (cartData) {
      cartData = JSON.parse(cartData);
      cartData.value = `"${data.id}"`;
      cartData.timeStored = Date.now();
      localStorage.setItem('M2_VENIA_BROWSER_PERSISTENCE__cartId', JSON.stringify(cartData));
    }
    // get the updated cart count
    const storedData = sessionStorage.getItem('DROPIN_CART_CART_DATA');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        const cartQuantity = document.getElementById('cartQuantity');
        cartQuantity.innerHTML = `Cart (${parsedData.totalQuantity})`;
      } catch (error) {
        console.error('Error parsing sessionStorage data:', error);
      }
    }
    // update cartId to localstorage after successful login
    const storageKeys = Object.keys(localStorage);
    const cartKey = storageKeys.find((key) => key.startsWith('COMMERCE_CART_CACHE_'));
    if (cartKey) {
      const DEFAULT_EMPTY_CART = 'VAWqG5bABlIjmciYenRCc9qpDVX95GOq';
      // eslint-disable-next-line prefer-const
      let cartKeyData = JSON.parse(localStorage.getItem(cartKey));
      cartKeyData.id = data.id;
      const newCartKey = `COMMERCE_CART_CACHE_${data.id}`;
      const oldCartKey = `COMMERCE_CART_CACHE_${DEFAULT_EMPTY_CART}`;
      if (localStorage.getItem(oldCartKey) !== null) {
        localStorage.removeItem(oldCartKey);
      }
      localStorage.setItem(newCartKey, JSON.stringify(cartKeyData));
    }
  } else {
    sessionStorage.removeItem('DROPINS_CART_ID');
  }
};

export default async function initializeDropins() {
  const init = async () => {
    // Set auth headers on authenticated event
    events.on('authenticated', setAuthHeaders);

    // Cache cart data in session storage
    events.on('cart/data', persistCartDataInSession, { eager: true });

    // on page load, check if user is authenticated
    const token = getUserTokenCookie();
    // set auth headers
    setAuthHeaders(!!token);
    // emit authenticated event if token has changed
    events.emit('authenticated', !!token);

    // Event Bus Logger
    events.enableLogger(true);
    // Set Fetch Endpoint (Global)
    setEndpoint(await getConfigValue('commerce-core-endpoint'));

    events.on('aem/lcp', async () => {
      await import('./auth.js');

      // Recaptcha
      await import('@dropins/tools/recaptcha.js').then(({ setConfig, recaptchaFetchApi }) => {
        recaptchaFetchApi.setFetchGraphQlHeader('Hvt-Cacheable', 'true');
        setConfig();
        recaptchaFetchApi.removeFetchGraphQlHeader('Hvt-Cacheable');
      });
    });
  };

  // re-initialize on prerendering changes
  document.addEventListener('prerenderingchange', initializeDropins, { once: true });

  return init();
}

export function initializeDropin(cb) {
  let initialized = false;

  const init = async (force = false) => {
    // prevent re-initialization
    if (initialized && !force) {
      return;
    }
    // initialize drop-in
    await cb();
    initialized = true;
  };

  // re-initialize on prerendering changes
  document.addEventListener('prerenderingchange', () => init(true), { once: true });

  return init;
}
