import sendHvtTag from 'scripts/hvt-tag.js';
import { setCookie } from '../configs.js';
import { loadErrorResources } from 'scripts/commerce.js';

/* eslint-disable import/no-cycle */
export class Cart {
  constructor(key = Cart.CART_STORE) {
    this.subscribers = [];
    this.key = key;
    this.cartId = null;
    this.type = 'guest';
    this.cartId = Cart.getCartId();
  }

  static CARTID_STORE = 'M2_VENIA_BROWSER_PERSISTENCE__cartId';

  static CART_STORE = 'COMMERCE_CART_CACHE';

  static COOKIE_SESSION = 'COMMERCE_SESSION';

  static COOKIE_CART_ID = 'COMMERCE_CART_ID';

  static COOKIE_EXPIRATION_DAYS = 30;

  static CART_VERSION_KEY = 'CART_VERSION';

  static DEFAULT_EMPTY_CART = 'VAWqG5bABlIjmciYenRCc9qpDVX95GOq';

  static DEFAULT_CART = {
    items: [],
    id: null,
    total_quantity: 0,
  };

  static getCartId() {
    const cartIdField = window.localStorage.getItem(Cart.CARTID_STORE);
    if (!cartIdField) {
      return null;
    }
    try {
      const parsed = JSON.parse(cartIdField);
      return parsed.value.replaceAll('"', '');
    } catch (err) {
      console.error('Could not parse cartId', err);
      return null;
    }
  }

  static setCartId(cartId) {
    setCookie('DROPIN__CART__CART-ID', cartId);
    window.localStorage.setItem(
      Cart.CARTID_STORE,
      JSON.stringify({
        value: `"${cartId}"`,
        timeCartd: Date.now(),
      }),
    );
  }

  static getCookie(key) {
    return (
      document.cookie
        .split(';')
        .map((c) => c.trim())
        .filter((cookie) => cookie.startsWith(`${key}=`))
        .map((cookie) => decodeURIComponent(cookie.split('=')[1]))[0] || null
    );
  }

  static setCookie(key, value) {
    const expires = new Date(Date.now() + Cart.COOKIE_EXPIRATION_DAYS * 864e5).toUTCString();
    document.cookie = `${key}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
  }

  setCartId(cartId) {
    this.cartId = cartId;
    Cart.setCartId(cartId);
    this.setCart({
      ...this.getCart(),
      id: cartId,
    });
  }

  getCartId() {
    return this.cartId;
  }

  setCart(cart) {
    // Only store cart with proper id
    if (!this.cartId || !cart) {
      return;
    }

    cart.items = cart.items.filter((item) => item);
    this.cartId = cart.id;
    Cart.setCartId(cart.id);
    window.localStorage.setItem(`${this.key}_${cart.id}`, JSON.stringify(cart));
    window.localStorage.setItem(Cart.CART_VERSION_KEY, Date.now());

    var cartQuantity = document.getElementById('cartQuantity');
    if (!cartQuantity) {
      setTimeout(() => {
        this.setCart(cart);
      }, 200);
    } else {
      cartQuantity.innerHTML = `Cart <span>(${cart.total_quantity})</span>`;
    }

    this.subscribers.forEach((callback) => {
      callback(cart);
    });
  }

  getCart() {
    if (!this.cartId) {
      return Cart.DEFAULT_CART;
    }
    try {
      const parsed = JSON.parse(window.localStorage.getItem(`${this.key}_${this.cartId}`)) || Cart.DEFAULT_CART;
      return parsed;
    } catch (err) {
      console.error('Failed to parse cart from local storage. Resetting it.');
      window.localStorage.removeItem(`${this.key}_${this.cartId}`);
    }
    return Cart.DEFAULT_CART;
  }

  resetCart() {
    window.localStorage.removeItem(`${this.key}_${this.cartId}`);
    this.cartId = null;
  }

  subscribe(callback) {
    this.subscribers.push(callback);

    if (this.getCart().items.length > 0) {
      callback(this.getCart());
    }

    return () => {
      this.subscribers = this.subscribers.filter((cb) => cb !== callback);
    };
  }
}

export const cartStore = new Cart();

const handleError = async (error) => {
  const { ErrorCodes } = await loadErrorResources();
  if (error.code === ErrorCodes?.NO_SUCH_ENTITY || error.code === ErrorCodes?.AUTHORIZATION_ERROR) {
    cartStore.resetCart();
  }

  return { error };
};

const loadCartModule = async () => {
  if (!loadCartModule.cache) {
    loadCartModule.cache = import('./cart.js');
  }
  return loadCartModule.cache;
};

async function withCartUpdate(fnName, ...fnArgs) {
  const mod = await loadCartModule();
  const fn = mod[fnName];
  const { cart, error } = await fn(...fnArgs);
  if (error) return await handleError(error);
  cartStore.setCart(cart);
  return { cart };
}

// The cart API provides methods to interact with the cart, such as adding items, fetching the cart, and toggling the cart view.
export const cartApi = {
  addToCart: async ({ sku, options, quantity, source = 'product-detail', openCart = true } = {}) => {
    try {
      if (!sku || !quantity) throw new Error('SKU and quantity are required to add an item to the cart');

      const mod = await loadCartModule();
      const { getNonDummyCartId, addToCart: addFn, pushCartToAdobeDataLayer, sendAddToCartCompletedEvent } = mod;

      // Ensure we have real cart ID.
      const { cartId, error: cartIdError } = await getNonDummyCartId(cartStore.getCartId());
      if (cartIdError) {
        return handleError(cartIdError);
      }
      cartStore.setCartId(cartId);

      // Call graphQL add to cart mutation.
      const { cart, error } = await addFn(sku, options, quantity, source, cartStore.getCartId());
      if (error) {
        return handleError(error);
      }

      // Update store + instrumentation.
      cartStore.setCart(cart);
      pushCartToAdobeDataLayer(cart, source);
      sendAddToCartCompletedEvent();
      sendHvtTag(122, sku);

      // Optionally open the minicart.
      if (openCart) {
        const { showCart } = await import('./Minicart.js');
        showCart();
      }

      return { cart };
    } catch (error) {
      console.error('Error in cartApi.addToCart:', error);
      return { error };
    }
  },
  addSentWorksheetItemToCart: async ({
    sku,
    worksheetId,
    sequence,
    source = 'sent-worksheet',
    openCart = true,
  } = {}) => {
    try {
      if (!sku || !worksheetId || !sequence)
        throw new Error('sku, worksheetId and sequence are required to add a worksheet item to the cart');

      const mod = await loadCartModule();
      const {
        getNonDummyCartId,
        addWorksheetItemToCart: addWorksheetItemFn,
        pushCartToAdobeDataLayer,
        sendAddToCartCompletedEvent,
      } = mod;

      // Ensure we have real cart ID.
      const { cartId, error: cartIdError } = await getNonDummyCartId(cartStore.getCartId());
      if (cartIdError) {
        return handleError(cartIdError);
      }
      cartStore.setCartId(cartId);

      // Call graphQL add to cart mutation.
      const { cart, error } = await addWorksheetItemFn(worksheetId, sequence, source, cartStore.getCartId());
      if (error) {
        return handleError(error);
      }

      // Update store + instrumentation.
      cartStore.setCart(cart);
      pushCartToAdobeDataLayer(cart, source);
      sendAddToCartCompletedEvent();
      sendHvtTag(122, sku);

      // Optionally open the minicart.
      if (openCart) {
        const { showCart } = await import('./Minicart.js');
        showCart();
      }

      return { cart };
    } catch (error) {
      console.error('Error in cartApi.addSentWorksheetItemToCart:', error);
      return { error };
    }
  },
  addSentWorksheetToCart: async ({ worksheetId, source = 'sent-worksheet', openCart = true } = {}) => {
    try {
      if (!worksheetId) throw new Error('worksheetId required to add a worksheet item to the cart');

      const mod = await loadCartModule();
      const {
        getNonDummyCartId,
        addWorksheetToCart: addWorksheetFn,
        pushCartToAdobeDataLayer,
        sendAddToCartCompletedEvent,
      } = mod;

      // Ensure we have real cart ID.
      const { cartId, error: cartIdError } = await getNonDummyCartId(cartStore.getCartId());
      if (cartIdError) {
        return handleError(cartIdError);
      }
      cartStore.setCartId(cartId);

      // Call graphQL add to cart mutation.
      const { cart, error } = await addWorksheetFn(worksheetId, source, cartStore.getCartId());
      if (error) {
        return handleError(error);
      }

      // Update store + instrumentation.
      cartStore.setCart(cart);
      pushCartToAdobeDataLayer(cart, source);
      sendAddToCartCompletedEvent();
      // sendHvtTag(122, sku);

      // Optionally open the minicart.
      if (openCart) {
        const { showCart } = await import('./Minicart.js');
        showCart();
      }

      return { cart };
    } catch (error) {
      console.error('Error in cartApi.addSentWorksheetToCart:', error);
      return { error };
    }
  },
  removeWorksheetFromCart: async ({ worksheetId, source = 'minicart' }) => {
    try {
      if (!worksheetId) throw new Error('worksheetId required to remove a worksheet item from the cart');

      const mod = await loadCartModule();
      const { removeWorksheetFromCart, pushCartToAdobeDataLayer } = mod;

      // Call graphQL remove-from-cart mutation.
      const { cart, error } = await removeWorksheetFromCart(worksheetId, cartStore.getCartId());
      if (error) {
        return handleError(error);
      }

      // Update store + instrumentation.
      cartStore.setCart(cart);
      pushCartToAdobeDataLayer(cart, source);

      return { cart };
    } catch (error) {
      console.error('Error in cartApi.removeWorksheetFromCart:', error);
      return { error };
    }
  },
  createCart: async () => {
    const mod = await loadCartModule();
    const { createCart, mergeCartsAfterSignIn } = mod;

    // Create a new cart.
    const { cartId, error } = await createCart();
    if (error) return handleError(error);

    // If old cart, merge it with the new one.
    const stored = cartStore.getCartId();
    if (stored && stored !== Cart.DEFAULT_EMPTY_CART) {
      const { cartId: mergedCartId, error: mergeError } = await mergeCartsAfterSignIn(stored, cartId);
      if (mergeError) return handleError(mergeError);
      cartStore.setCartId(mergedCartId);
      return { cartId: mergedCartId };
    }

    // Otherwise use the new one.
    cartStore.setCartId(cartId);
    return { cartId };
  },
  getCart: async () => {
    if (!cartStore.getCartId()) {
      cartStore.setCartId(Cart.DEFAULT_EMPTY_CART);
    }
    return withCartUpdate('getCart', cartStore.getCartId());
  },
  removeItemFromCart: async (uid) => withCartUpdate('removeItemFromCart', uid, cartStore.getCartId()),
  updateQuantityOfCartItem: async (cartItemUid, quantity) =>
    withCartUpdate('updateQuantityOfCartItem', cartItemUid, quantity, cartStore.getCartId()),
  addWarrantyToCartItem: async (item) => withCartUpdate('addWarrantyToCartItem', item, cartStore.getCartId()),
  removeWarrantyFromCartItem: async (item) => withCartUpdate('removeWarrantyFromCartItem', item, cartStore.getCartId()),
  toggleCart: async () => {
    const { toggle } = await import('./Minicart.js');
    toggle();
  },
  cartItemsQuantity: {
    watch: (callback) => {
      cartStore.subscribe((cart) => {
        callback(cart.total_quantity || 0);
      });
    },
  },
};
